import type { ICRUDRepository } from '@deterministic-code/datasources'
import { log, type Log } from '../../generated/types/view/log.ts'

/** The seeded log type names. */
export type LogLevel = 'Error' | 'Information' | 'Verbose' | 'Trace'

/** Application log kept in the database (`logs` rows with a type and optional name/value attributes). */
export class LogsService {
  constructor(private readonly logs: ICRUDRepository<Log>) {}

  /** Writes one entry. A failure to log is printed and swallowed: logging must never break the request that caused it. */
  async write(level: LogLevel, message: string, attributes: Record<string, string> = {}): Promise<void> {
    try {
      await this.logs.create(log({ logTypeName: level, message, attributes }))
    } catch (error) {
      console.error(`log ${level}: ${message} (not stored: ${error instanceof Error ? error.message : String(error)})`)
    }
  }

  error = (message: string, attributes?: Record<string, string>) => this.write('Error', message, attributes)
  information = (message: string, attributes?: Record<string, string>) => this.write('Information', message, attributes)
  verbose = (message: string, attributes?: Record<string, string>) => this.write('Verbose', message, attributes)
  trace = (message: string, attributes?: Record<string, string>) => this.write('Trace', message, attributes)
}
