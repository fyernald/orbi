import { createAuth } from './src/auth';
import { createDb } from './src/db';

// Only for the Better Auth CLI, which needs an `auth` export to generate the login tables.
// Generating never connects or signs anything, so these values are placeholders.
export const auth = createAuth({
	db: createDb(process.env.DATABASE_URL ?? ''),
	secret: 'only-used-to-generate-the-schema-000000',
	baseURL: 'http://localhost:3000',
});
