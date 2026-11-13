import { createTransport, type Transporter } from 'nodemailer'
import type { LogsService } from './logs.ts'

/**
 * Sends mail over SMTP. Settings: SMTP_HOST (unset = log the message instead of sending), SMTP_PORT, SMTP_USERNAME,
 * SMTP_PASSWORD, SMTP_FROM (default "no-reply@localhost"), SMTP_SECURE = starttls (default) | tls | none.
 */
export class EmailService {
  private readonly transport?: Transporter
  private readonly from: string

  constructor(
    private readonly logs: LogsService,
    env: NodeJS.ProcessEnv = process.env,
  ) {
    this.from = env.SMTP_FROM || 'no-reply@localhost'
    if (!env.SMTP_HOST) return
    const secure = (env.SMTP_SECURE || 'starttls').toLowerCase()
    if (!['starttls', 'tls', 'none'].includes(secure)) throw new Error(`SMTP_SECURE must be starttls, tls or none, not "${secure}"`)
    const port = env.SMTP_PORT ? Number(env.SMTP_PORT) : secure === 'tls' ? 465 : 587
    if (!Number.isInteger(port)) throw new Error('SMTP_PORT must be a number')
    this.transport = createTransport({
      host: env.SMTP_HOST,
      port,
      secure: secure === 'tls',
      requireTLS: secure === 'starttls',
      ignoreTLS: secure === 'none',
      auth: env.SMTP_USERNAME && env.SMTP_PASSWORD ? { user: env.SMTP_USERNAME, pass: env.SMTP_PASSWORD } : undefined,
    })
  }

  /**
   * Sends a text + html message. Without SMTP settings the message is written to the log (Information) and counts as sent,
   * so a developer can follow the link in it.
   */
  async send(to: string, subject: string, text: string, html: string): Promise<void> {
    if (!this.transport) {
      await this.logs.information('email not sent: SMTP_HOST is not set', { to, subject, text })
      return
    }
    try {
      await this.transport.sendMail({ from: this.from, to, subject, text, html })
      await this.logs.information('email sent', { to, subject })
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)
      await this.logs.error('email failed', { to, subject, error: reason })
      throw new Error(reason)
    }
  }
}
