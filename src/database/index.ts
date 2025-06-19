import { Kysely, SqliteDialect } from 'kysely'
import SQLite from 'better-sqlite3'

export const db = new Kysely<DB>({
  dialect: new SqliteDialect({
    database: new SQLite('database/XelaRelam.sqlite'),
  }),
})