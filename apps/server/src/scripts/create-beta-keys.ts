import { createDb } from '../db';
import {
	createBetaKey,
	hashBetaKey,
	normalizeBetaKey,
} from '../modules/beta/keys';
import { createBetaRepository } from '../modules/beta/repository';

// Makes beta keys (US-50) and prints them once. Only their hashes are saved, so
// copy the keys to the password manager now: they cannot be shown again.
//   pnpm --filter server keys:create 20
//   docker compose exec server node dist/create-beta-keys.js 20   (on the VPS)
const count = Number(process.argv[2] ?? 1);
if (!Number.isInteger(count) || count < 1 || count > 500) {
	console.error('Say how many keys to make, from 1 to 500.');
	process.exit(1);
}
if (!process.env.DATABASE_URL) {
	console.error('Set DATABASE_URL first.');
	process.exit(1);
}

const db = createDb(process.env.DATABASE_URL);
const keys = Array.from({ length: count }, createBetaKey);
await createBetaRepository(db).addKeys(
	keys.map((key) => hashBetaKey(normalizeBetaKey(key)!))
);
await db.$client.end();

console.log(keys.join('\n'));
