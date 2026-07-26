import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import { schema } from './schema'

/**
 * Standard singleton pattern for Next.js to prevent connection exhaustion 
 * during Hot Module Replacement (HMR) in development.
 */
const globalForDb = global as unknown as {
  pool: mysql.Pool | undefined;
};

const poolConnection = globalForDb.pool ?? mysql.createPool({
  host:             process.env.DB_HOST!,
  port:             parseInt(process.env.DB_PORT ?? '3306'),
  user:             process.env.DB_USER!,
  password:         process.env.DB_PASS!,
  database:         process.env.DB_NAME!,
  waitForConnections: true,
  connectionLimit:  10,
  queueLimit:       0,
  enableKeepAlive:  true,
  keepAliveInitialDelay: 10000,
  connectTimeout:   20000,
});

if (process.env.NODE_ENV !== "production") globalForDb.pool = poolConnection;

export const db = drizzle(poolConnection, { schema, mode: 'default' });

export { schema }
export type { InferSelectModel } from 'drizzle-orm'
