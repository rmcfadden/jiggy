import { DatasourceFactory } from '@deterministic-code/datasources'
import { SqliteDriver } from '@deterministic-code/datasources-sqlite'
import { PostgresDriver } from '@deterministic-code/datasources-postgres'
import { MysqlDriver } from '@deterministic-code/datasources-mysql'

DatasourceFactory.register('sqlite', new SqliteDriver())
DatasourceFactory.register('postgres', new PostgresDriver())
DatasourceFactory.register('mysql', new MysqlDriver())
