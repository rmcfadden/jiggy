import { isIPv4, isIPv6 } from 'node:net'
import type { ICRUDRepository } from '@deterministic-code/datasources'
import type { SessionType } from '../../generated/types/datasource/sessionType.ts'
import { sessionHit, type SessionHit } from '../../generated/types/view/sessionHit.ts'
import { session, type Session } from '../../generated/types/view/session.ts'
import type { TokenService } from './tokens.ts'

export const SIGNIN_SESSION_TYPE = 'Signin'

export type CreateSessionInput = {
  userId: number
  type?: string
  ip?: string
  /** Seconds of inactivity after which the session lapses. */
  relativeExpiration?: number
  absoluteExpiration?: Date
}

/** Creates sessions, records each hit with the caller's IP, and revokes sessions along with their tokens. */
export class SessionService {
  constructor(
    private readonly sessions: ICRUDRepository<Session>,
    private readonly sessionHits: ICRUDRepository<SessionHit>,
    private readonly sessionTypes: ICRUDRepository<SessionType>,
    private readonly tokens: TokenService,
  ) {}

  async create(input: CreateSessionInput): Promise<Session> {
    const typeName = input.type ?? SIGNIN_SESSION_TYPE
    let sessionTypeId: number | undefined
    for await (const row of this.sessionTypes.read()) if (row.name === typeName) sessionTypeId = Number(row.id)
    if (sessionTypeId === undefined) throw new Error(`session type "${typeName}" is missing; run the migrations`)

    const created = await this.sessions.create(
      session({ sessionTypeId, userId: input.userId, relativeExpiration: input.relativeExpiration ?? null, absoluteExpiration: input.absoluteExpiration ?? null, revoked: null, expired: null, isEnabled: true } as Partial<Session>),
    )
    try {
      await this.recordHit(created.id, input.ip)
    } catch (error) {
      await this.sessions.delete(created)
      throw error
    }
    return created
  }

  /** Records a hit and returns the session when it is still active; undefined when unknown, revoked or lapsed. */
  async hit(uuid: string, ip?: string): Promise<Session | undefined> {
    const found = await this.get(uuid)
    if (!found || !(await this.isActive(found))) return undefined
    await this.recordHit(found.id, ip)
    return found
  }

  async get(uuid: string): Promise<Session | undefined> {
    for await (const row of this.sessions.read()) if (row.uuid === uuid) return row
    return undefined
  }

  /** Active = enabled, not revoked, not past its absolute expiry and not idle longer than its relative expiry. */
  async isActive(row: Session, now = Date.now()): Promise<boolean> {
    if (!row.isEnabled || row.revoked || row.expired) return false
    if (row.absoluteExpiration && row.absoluteExpiration.getTime() <= now) return false
    if (row.relativeExpiration) {
      let last = row.created.getTime()
      for await (const hit of this.sessionHits.read()) if (Number(hit.sessionId) === Number(row.id)) last = Math.max(last, hit.created.getTime())
      if (last + row.relativeExpiration * 1000 <= now) return false
    }
    return true
  }

  /** Revokes the session and every access/refresh token issued for it. Returns false when it does not exist. */
  async revoke(uuid: string): Promise<boolean> {
    const found = await this.get(uuid)
    if (!found) return false
    if (!found.revoked) await this.sessions.update({ ...found, revoked: new Date(), isEnabled: false })
    await this.tokens.revokeForSession(uuid)
    return true
  }

  private recordHit(sessionId: number, ip?: string): Promise<SessionHit> {
    return this.sessionHits.create(sessionHit({ sessionId, ipAddress: ipToBase64(ip) }))
  }
}

/** 16-byte (IPv6) form of an address, base64 as the binary column expects; IPv4 is mapped to ::ffff:a.b.c.d. Unknown input is all zeros. */
export function ipToBase64(ip?: string): string {
  const bytes = Buffer.alloc(16)
  if (ip && isIPv4(ip)) {
    bytes.fill(0xff, 10, 12)
    ip.split('.').forEach((part, i) => (bytes[12 + i] = Number(part)))
  } else if (ip && isIPv6(ip)) {
    const mapped = ip.match(/^(.*:)(\d+\.\d+\.\d+\.\d+)$/)
    const text = mapped ? `${mapped[1]}${ipv4Hextets(mapped[2])}` : ip
    const [head, tail] = text.split('::')
    const left = head ? head.split(':') : []
    const right = tail === undefined ? [] : tail ? tail.split(':') : []
    const groups = tail === undefined ? left : [...left, ...Array(Math.max(0, 8 - left.length - right.length)).fill('0'), ...right]
    groups.slice(0, 8).forEach((g, i) => bytes.writeUInt16BE(parseInt(g, 16) || 0, i * 2))
  }
  return bytes.toString('base64')
}

function ipv4Hextets(v4: string): string {
  const [a, b, c, d] = v4.split('.').map(Number)
  return `${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`
}
