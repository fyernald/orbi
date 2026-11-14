import { and, eq, isNull, sql } from 'drizzle-orm';
import type { Db } from '../../db';
import { betaAccess, betaKey } from '../../db/schema';

export interface BetaRepository {
	findAccessEnd(userId: string): Promise<Date | null>;
	// Marks the key used and gives the student `days` more access, in one
	// transaction. Null when no unused key has this hash.
	redeemKey(
		userId: string,
		keyHash: string,
		days: number,
		now: Date
	): Promise<Date | null>;
	// for the script that makes keys; not tied to a student
	addKeys(keyHashes: string[]): Promise<void>;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function createBetaRepository(db: Db): BetaRepository {
	return {
		async findAccessEnd(userId) {
			const [row] = await db
				.select({ endsAt: betaAccess.endsAt })
				.from(betaAccess)
				.where(eq(betaAccess.userId, userId));
			return row?.endsAt ?? null;
		},

		redeemKey(userId, keyHash, days, now) {
			return db.transaction(async (tx) => {
				// only an unused key changes, so two students who send the same key at
				// the same moment cannot both get it: the second one updates nothing
				const [used] = await tx
					.update(betaKey)
					.set({ usedBy: userId, usedAt: now })
					.where(and(eq(betaKey.keyHash, keyHash), isNull(betaKey.usedAt)))
					.returning({ id: betaKey.id });
				if (!used) return null;

				// added to what is left, or counted from now when access has ended
				const endsAt = new Date(now.getTime() + days * DAY_MS);
				const [access] = await tx
					.insert(betaAccess)
					.values({ userId, endsAt })
					.onConflictDoUpdate({
						target: betaAccess.userId,
						set: {
							endsAt: sql`greatest(${betaAccess.endsAt}, ${now}) + make_interval(days => ${days})`,
						},
					})
					.returning({ endsAt: betaAccess.endsAt });
				return access!.endsAt;
			});
		},

		async addKeys(keyHashes) {
			if (keyHashes.length === 0) return;
			await db
				.insert(betaKey)
				.values(keyHashes.map((keyHash) => ({ keyHash })));
		},
	};
}
