import { MockLanguageModelV4 } from 'ai/test';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createModelRegistry } from '../../ai/models';
import { profile, user } from '../../db/schema';
import { createTestDb } from '../../db/testing';
import { createMemoryMailer } from '../../mail/testing';
import { createTestApp, signUpTestUser } from '../../testing';

// only Gemini has a key, so the Claude models are not on the list
const models = createModelRegistry({
	providers: { google: () => new MockLanguageModelV4() },
});
let db: Awaited<ReturnType<typeof createTestDb>>;
let app: Awaited<ReturnType<typeof createTestApp>>;

beforeAll(async () => {
	db = await createTestDb();
	app = await createTestApp(createMemoryMailer(), {
		requireEmailVerification: false,
		models,
		db,
	});
});

afterAll(async () => {
	await app.close();
});

const send = (
	cookie: string,
	method: 'GET' | 'PATCH',
	url: string,
	payload?: object
) => app.inject({ method, url, headers: { cookie }, payload });

const defaultModelOf = async (cookie: string) =>
	(await send(cookie, 'GET', '/api/models')).json().defaultModelId;

// a saved id this server can no longer call; no route can save one
async function saveStraightToDb(email: string, defaultModelId: string) {
	const [found] = await db
		.select({ id: user.id })
		.from(user)
		.where(eq(user.email, email));
	await db
		.insert(profile)
		.values({ userId: found!.id, defaultModelId })
		.onConflictDoUpdate({ target: profile.userId, set: { defaultModelId } });
}

describe('default model', () => {
	it("starts new chats on the server's default until the student picks one", async () => {
		const ada = await signUpTestUser(app, 'ada@test.dev');

		expect(await defaultModelOf(ada)).toBe('gemini-flash');
		expect((await send(ada, 'GET', '/api/profile')).json().defaultModelId).toBe(
			null
		);
	});

	it('saves a model from the list as the default', async () => {
		const grace = await signUpTestUser(app, 'grace@test.dev');

		const response = await send(grace, 'PATCH', '/api/profile', {
			defaultModelId: 'gemini-pro',
		});

		expect(response.statusCode).toBe(200);
		expect(response.json().defaultModelId).toBe('gemini-pro');
		expect(await defaultModelOf(grace)).toBe('gemini-pro');
	});

	it('goes back to the server default when the student clears it', async () => {
		const linus = await signUpTestUser(app, 'linus@test.dev');
		await send(linus, 'PATCH', '/api/profile', {
			defaultModelId: 'gemini-pro',
		});

		await send(linus, 'PATCH', '/api/profile', { defaultModelId: null });

		expect(await defaultModelOf(linus)).toBe('gemini-flash');
	});

	it.each([
		['is not in the catalog', 'made-up-model'],
		['has no API key on this server', 'claude-sonnet'],
	])('refuses a model that %s', async (_, defaultModelId) => {
		const ken = await signUpTestUser(app, `ken-${defaultModelId}@test.dev`);

		const response = await send(ken, 'PATCH', '/api/profile', {
			defaultModelId,
		});

		expect(response.statusCode).toBe(400);
		expect(response.json().error.message).toBe('Choose a model from the list.');
		expect((await send(ken, 'GET', '/api/profile')).json().defaultModelId).toBe(
			null
		);
	});

	it.each([
		['lost its API key', 'claude-opus'],
		['was taken out of the catalog', 'gemini-old'],
	])(
		'falls back to the server default when the saved model %s',
		async (_, savedId) => {
			const email = `dennis-${savedId}@test.dev`;
			const dennis = await signUpTestUser(app, email);
			await saveStraightToDb(email, savedId);

			const response = await send(dennis, 'GET', '/api/models');

			expect(response.statusCode).toBe(200);
			expect(response.json().defaultModelId).toBe('gemini-flash');
		}
	);
});
