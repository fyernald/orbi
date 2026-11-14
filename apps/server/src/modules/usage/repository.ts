import { eq, sql } from 'drizzle-orm';
import type { Db } from '../../db';
import { aiUsage } from '../../db/schema';
import { HOUR_MS, WEEK_MS, type SavedWindow } from './limits';

export type SavedUsage = { hour: SavedWindow; week: SavedWindow };

export interface UsageRepository {
	findUsage(userId: string): Promise<SavedUsage>;
	addCredits(userId: string, credits: number, now: Date): Promise<void>;
	// every student together, for the beta's total budget
	totalCredits(): Promise<number>;
}

const EMPTY: SavedUsage = {
	hour: { startedAt: null, credits: 0 },
	week: { startedAt: null, credits: 0 },
};

export function createUsageRepository(db: Db): UsageRepository {
	return {
		async findUsage(userId) {
			const [row] = await db
				.select()
				.from(aiUsage)
				.where(eq(aiUsage.userId, userId));
			if (!row) return EMPTY;
			return {
				hour: { startedAt: row.hourStartedAt, credits: row.hourCredits },
				week: { startedAt: row.weekStartedAt, credits: row.weekCredits },
			};
		},

		// One statement, so two replies that end at the same moment both count. A
		// window that has ended starts again now with these credits.
		async addCredits(userId, credits, now) {
			const hourOpen = sql`${aiUsage.hourStartedAt} > ${new Date(now.getTime() - HOUR_MS)}`;
			const weekOpen = sql`${aiUsage.weekStartedAt} > ${new Date(now.getTime() - WEEK_MS)}`;
			await db
				.insert(aiUsage)
				.values({
					userId,
					hourStartedAt: now,
					hourCredits: credits,
					weekStartedAt: now,
					weekCredits: credits,
					totalCredits: credits,
				})
				.onConflictDoUpdate({
					target: aiUsage.userId,
					set: {
						hourStartedAt: sql`case when ${hourOpen} then ${aiUsage.hourStartedAt} else ${now} end`,
						hourCredits: sql`case when ${hourOpen} then ${aiUsage.hourCredits} + ${credits} else ${credits} end`,
						weekStartedAt: sql`case when ${weekOpen} then ${aiUsage.weekStartedAt} else ${now} end`,
						weekCredits: sql`case when ${weekOpen} then ${aiUsage.weekCredits} + ${credits} else ${credits} end`,
						totalCredits: sql`${aiUsage.totalCredits} + ${credits}`,
					},
				});
		},

		async totalCredits() {
			const [row] = await db
				.select({
					total: sql<string>`coalesce(sum(${aiUsage.totalCredits}), 0)`,
				})
				.from(aiUsage);
			return Number(row?.total ?? 0);
		},
	};
}
