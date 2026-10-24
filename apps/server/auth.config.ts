import { createAuth } from './src/auth';
import { createDb } from './src/db';

// Only for the Better Auth CLI, which needs an `auth` export to generate the login tables.
// Generating never connects, so the url can be empty.
export const auth = createAuth(createDb(process.env.DATABASE_URL ?? ''));
