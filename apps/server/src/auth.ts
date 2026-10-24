import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';
import * as schema from './db/schema';

// BETTER_AUTH_SECRET and BETTER_AUTH_URL are read from the environment.
// After changing this config, regenerate the login tables (see docs/database.md).
export const auth = betterAuth({
	database: drizzleAdapter(db, { provider: 'pg', schema }),
	emailAndPassword: { enabled: true },
});
