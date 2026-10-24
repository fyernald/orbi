import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

const url = process.env.DATABASE_URL;
if (!url) {
	throw new Error('DATABASE_URL is not set. Copy .env.example to .env.');
}

// the pool connects on the first query, not on import
export const db = drizzle({ connection: url, schema });

export type Db = typeof db;
