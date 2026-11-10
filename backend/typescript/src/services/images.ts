import { randomUUID } from 'node:crypto'
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { basename, extname, join, resolve } from 'node:path'
import sharp from 'sharp'
import type { ICRUDRepository } from '@deterministic-code/datasources'
import { resource, type Resource } from '../../generated/types/view/resource.ts'
import type { MimeType } from '../../generated/types/datasource/mimeType.ts'

/** What the API exchanges; `url` is the resource's `location`. */
export type ImageDto = { id: number; uuid: string; name: string; mimeType: string; description: string; url: string; created: Date; updated: Date }
export type ImageUpload = { data: Buffer; contentType: string; fileName?: string }

export class UnsupportedImageTypeError extends Error {
  constructor(type: string) {
    super(`unsupported image type: ${type}`)
  }
}

export const THUMBNAIL_SUFFIX = '_thumbnail'
const THUMBNAIL_WIDTH = 480

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg', 'image/png': '.png', 'image/gif': '.gif', 'image/webp': '.webp',
  'image/svg+xml': '.svg', 'image/bmp': '.bmp', 'image/tiff': '.tif', 'image/x-icon': '.ico', 'image/avif': '.avif',
}
/** Rasters we cannot (or need not) shrink: no thumbnail row is made for these. */
const NO_THUMBNAIL = new Set(['image/svg+xml', 'image/tiff', 'image/avif', 'image/x-icon'])

/** Content type for a stored key, from its extension. */
export const contentTypeOf = (key: string): string | undefined =>
  Object.entries(EXTENSIONS).find(([, ext]) => key.toLowerCase().endsWith(ext))?.[0]

/**
 * Pictures kept as `resource` rows, with the bytes in a local folder served at `/api/images/files/{key}`. Raster
 * images also get a resized copy as a second resource named `{name}_thumbnail`, which `list` hides.
 */
export class ImagesService {
  private readonly root: string

  constructor(
    private readonly repo: ICRUDRepository<Resource>,
    private readonly mimes: ICRUDRepository<MimeType>,
    directory: string = process.env.IMAGES_PATH ?? 'uploads',
    private readonly publicBaseUrl: string = process.env.IMAGES_PUBLIC_BASE_URL ?? '',
  ) {
    this.root = resolve(directory)
  }

  async create(upload: ImageUpload, name?: string, description?: string): Promise<ImageDto> {
    const type = normalize(upload.contentType)
    await this.checkMime(type)
    const image = await this.createRow(name ?? upload.fileName ?? '', description ?? '', type, upload.data)
    await this.saveThumbnail(image.name, description ?? '', type, upload.data)
    return image
  }

  /** Every image, oldest first, without the generated thumbnail rows. */
  async list(): Promise<ImageDto[]> {
    return (await this.rows()).filter((r) => !r.resourceName.endsWith(THUMBNAIL_SUFFIX)).map(toDto).sort((a, b) => a.id - b.id)
  }

  /** Looks an image up by id, uuid or name (first one given wins); undefined when none matches. */
  async find(by: { id?: number; uuid?: string; name?: string }): Promise<ImageDto | undefined> {
    const row = await this.findRow(by)
    return row ? toDto(row) : undefined
  }

  /** Image id to the URL of its generated thumbnail; images without a thumbnail are left out. */
  async thumbnailUrls(): Promise<Map<number, string>> {
    const rows = await this.rows()
    const thumbs = new Map(rows.filter((r) => r.resourceName.endsWith(THUMBNAIL_SUFFIX)).map((r) => [r.resourceName, r.location]))
    const urls = new Map<number, string>()
    for (const row of rows) {
      const url = thumbs.get(row.resourceName + THUMBNAIL_SUFFIX)
      if (url) urls.set(Number(row.id), url)
    }
    return urls
  }

  /** Merges the fields present, swapping the bytes when `upload` is given; undefined when it does not exist. The thumbnail row follows. */
  async replace(id: number, upload: ImageUpload | undefined, name?: string, description?: string): Promise<ImageDto | undefined> {
    const row = await this.repo.readSingleById(id)
    if (!row || row.isDeleted) return undefined
    const oldName = row.resourceName
    let type = row.mimeTypeName
    if (upload) {
      type = normalize(upload.contentType)
      await this.checkMime(type)
      const oldKey = keyFromUrl(row.location)
      // A fresh key, so caches of the old URL cannot serve the new bytes.
      row.location = await this.save(keyFor(randomUUID(), type), upload.data)
      row.mimeTypeName = type
      await this.removeFile(oldKey)
    }
    row.resourceName = name ?? row.resourceName
    row.description = description ?? row.description
    await this.repo.update(row)

    if (!row.resourceName.endsWith(THUMBNAIL_SUFFIX)) {
      if (upload) {
        await this.deleteRow(await this.findRow({ name: oldName + THUMBNAIL_SUFFIX }))
        await this.saveThumbnail(row.resourceName, row.description, type, upload.data)
      } else {
        const thumb = await this.findRow({ name: oldName + THUMBNAIL_SUFFIX })
        if (thumb) {
          thumb.resourceName = row.resourceName + THUMBNAIL_SUFFIX
          thumb.description = row.description
          await this.repo.update(thumb)
        }
      }
    }
    return toDto(row)
  }

  /** Removes the image, its stored bytes and its thumbnail. */
  async delete(id: number): Promise<boolean> {
    const row = await this.repo.readSingleById(id)
    if (!row || row.isDeleted) return false
    if (!row.resourceName.endsWith(THUMBNAIL_SUFFIX)) await this.deleteRow(await this.findRow({ name: row.resourceName + THUMBNAIL_SUFFIX }))
    await this.deleteRow(row)
    return true
  }

  /**
   * Uploads every image under `directory`/<category>/<slug>.* (the frontend catalog) as resource `slug` with the
   * category as description. Names that already exist are skipped; returns the names added.
   */
  async addSamples(directory: string): Promise<string[]> {
    const added: string[] = []
    const files = await walk(directory)
    const have = new Set((await this.rows()).map((r) => r.resourceName))
    for (const file of files.sort()) {
      const type = contentTypeOf(extname(file).toLowerCase().replace('.jpeg', '.jpg'))
      const name = basename(file, extname(file))
      if (!type || have.has(name)) continue
      await this.create({ data: await readFile(file), contentType: type, fileName: basename(file) }, name, basename(resolve(file, '..')))
      have.add(name)
      added.push(name)
    }
    return added
  }

  /** The bytes behind a key, or undefined when there are none. Keys are plain file names. */
  async open(key: string): Promise<Buffer | undefined> {
    try {
      return await readFile(this.pathFor(key))
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return undefined
      throw err
    }
  }

  private async createRow(name: string, description: string, type: string, bytes: Buffer): Promise<ImageDto> {
    const row = resource({ resourceName: name, mimeTypeName: type, description })
    row.location = await this.save(keyFor(row.uuid, type), bytes)
    const created = await this.repo.create(row)
    return toDto((await this.repo.readSingleById(created.id)) ?? created)
  }

  private async saveThumbnail(name: string, description: string, type: string, bytes: Buffer): Promise<void> {
    if (name.endsWith(THUMBNAIL_SUFFIX) || NO_THUMBNAIL.has(type)) return
    let thumb: Buffer
    try {
      thumb = await sharp(bytes).resize({ width: THUMBNAIL_WIDTH, withoutEnlargement: true }).jpeg({ quality: 80 }).toBuffer()
    } catch {
      return // not a raster sharp can decode
    }
    await this.createRow(name + THUMBNAIL_SUFFIX, description, 'image/jpeg', thumb)
  }

  private async save(key: string, bytes: Buffer): Promise<string> {
    await mkdir(this.root, { recursive: true })
    await writeFile(this.pathFor(key), bytes)
    return `${this.publicBaseUrl.replace(/\/$/, '')}/api/images/files/${key}`
  }

  private async removeFile(key: string): Promise<void> {
    await rm(this.pathFor(key), { force: true })
  }

  private async deleteRow(row: Resource | undefined): Promise<void> {
    if (!row) return
    await this.removeFile(keyFromUrl(row.location))
    await this.repo.delete(row)
  }

  private pathFor(key: string): string {
    if (!key || key !== basename(key) || key.startsWith('.')) throw new Error('invalid image key')
    return join(this.root, key)
  }

  private async rows(): Promise<Resource[]> {
    const rows: Resource[] = []
    for await (const row of this.repo.read()) if (!row.isDeleted) rows.push(row)
    return rows
  }

  private async findRow(by: { id?: number; uuid?: string; name?: string }): Promise<Resource | undefined> {
    return (await this.rows()).find((r) =>
      by.id !== undefined ? Number(r.id) === by.id : by.uuid !== undefined ? r.uuid === by.uuid : r.resourceName === by.name,
    )
  }

  /** Only the image types we know an extension for, and that exist in mime_type, are accepted. */
  private async checkMime(type: string): Promise<void> {
    if (!(type in EXTENSIONS)) throw new UnsupportedImageTypeError(type)
    for await (const m of this.mimes.read()) if (m.name === type) return
    throw new UnsupportedImageTypeError(type)
  }
}

const normalize = (contentType: string) => contentType.split(';')[0].trim().toLowerCase()
const keyFor = (uuid: string, type: string) => uuid.replaceAll('-', '') + EXTENSIONS[type]
const keyFromUrl = (url: string) => url.split('?')[0].replace(/\/$/, '').split('/').at(-1) ?? ''

const toDto = (r: Resource): ImageDto => ({
  id: Number(r.id), uuid: r.uuid, name: r.resourceName, mimeType: r.mimeTypeName, description: r.description, url: r.location, created: r.created, updated: r.updated,
})

async function walk(dir: string): Promise<string[]> {
  const found: string[] = []
  try {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) found.push(...(await walk(path)))
      else if ((await stat(path)).isFile()) found.push(path)
    }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err
  }
  return found
}
