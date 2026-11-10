import { Router } from 'express'
import multer from 'multer'
import { contentTypeOf, UnsupportedImageTypeError, type ImagesService } from '../services/images.ts'

const MAX_BYTES = Number(process.env.IMAGES_MAX_BYTES ?? 10 * 1024 * 1024)

const field = (value: unknown): string | undefined => (typeof value === 'string' ? value : undefined)

export function imagesRouter(service: ImagesService): Router {
  const router = Router()
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_BYTES } })

  // With id, uuid or name, looks one image up (the result carries the image url); with none, lists every image.
  router.get('/', async (req, res, next) => {
    try {
      const { id, guid, name } = req.query
      if (id === undefined && guid === undefined && name === undefined) return void res.json(await service.list())
      const image = await service.find({
        id: typeof id === 'string' ? Number(id) : undefined,
        uuid: typeof guid === 'string' ? guid : undefined,
        name: typeof name === 'string' ? name : undefined,
      })
      if (image) res.json(image)
      else res.sendStatus(404)
    } catch (err) {
      next(err)
    }
  })

  // Serves bytes for the local store.
  router.get('/files/:key', async (req, res, next) => {
    try {
      const type = contentTypeOf(req.params.key)
      if (!type) return void res.sendStatus(404)
      let data: Buffer | undefined
      try {
        data = await service.open(req.params.key)
      } catch {
        return void res.sendStatus(404)
      }
      if (!data) return void res.sendStatus(404)
      res.type(type).send(data)
    } catch (err) {
      next(err)
    }
  })

  router.get('/:id', async (req, res, next) => {
    try {
      const image = await service.find({ id: Number(req.params.id) })
      if (image) res.json(image)
      else res.sendStatus(404)
    } catch (err) {
      next(err)
    }
  })

  router.post('/', upload.single('file'), async (req, res, next) => {
    try {
      const file = req.file
      if (!file) return void res.status(400).json({ error: "multipart field 'file' is required" })
      const image = await service.create({ data: file.buffer, contentType: file.mimetype, fileName: file.originalname }, field(req.body?.name), field(req.body?.description))
      res.status(201).location(`/api/images/${image.id}`).json(image)
    } catch (err) {
      if (err instanceof UnsupportedImageTypeError) res.status(400).json({ error: err.message })
      else next(err)
    }
  })

  // Every field is optional: send a file to swap the image, name/description to edit the metadata.
  router.put('/:id', upload.single('file'), async (req, res, next) => {
    try {
      const file = req.file
      const image = await service.replace(
        Number(req.params.id),
        file ? { data: file.buffer, contentType: file.mimetype, fileName: file.originalname } : undefined,
        field(req.body?.name),
        field(req.body?.description),
      )
      if (image) res.json(image)
      else res.sendStatus(404)
    } catch (err) {
      if (err instanceof UnsupportedImageTypeError) res.status(400).json({ error: err.message })
      else next(err)
    }
  })

  router.delete('/:id', async (req, res, next) => {
    try {
      res.sendStatus((await service.delete(Number(req.params.id))) ? 204 : 404)
    } catch (err) {
      next(err)
    }
  })

  return router
}
