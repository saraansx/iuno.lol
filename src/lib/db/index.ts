import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import { schema } from './schema'

const globalForDb = global as unknown as {
  pool: mysql.Pool | undefined;
};

const poolConnection = globalForDb.pool ?? mysql.createPool({
  host:             process.env.DB_HOST!,
  port:             parseInt(process.env.DB_PORT ?? '3306'),
  user:             process.env.DB_USER!,
  password:         process.env.DB_PASS!,
  database:         process.env.DB_NAME!,
  timezone:         'Z',
  waitForConnections: true,
  connectionLimit:  20,
  queueLimit:       50,
  enableKeepAlive:  true,
  keepAliveInitialDelay: 10000,
  connectTimeout:   20000,
});

globalForDb.pool = poolConnection;

export const db = drizzle(poolConnection, { schema, mode: 'default' });

export { schema }
