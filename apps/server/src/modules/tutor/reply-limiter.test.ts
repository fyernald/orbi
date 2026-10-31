import { describe, expect, it } from 'vitest';
import { createReplyLimiter } from './reply-limiter';

describe('createReplyLimiter', () => {
	it('lets each student run up to the limit', () => {
		const limiter = createReplyLimiter(2);

		expect(limiter.acquire('ada')).toBeDefined();
		expect(limiter.acquire('ada')).toBeDefined();
		expect(limiter.acquire('ada')).toBeUndefined();
		// another student has their own count
		expect(limiter.acquire('grace')).toBeDefined();
	});

	it('frees a place when a reply ends, only once per reply', () => {
		const limiter = createReplyLimiter(1);
		const release = limiter.acquire('ada')!;

		release();
		release();
		const next = limiter.acquire('ada');

		expect(next).toBeDefined();
		expect(limiter.acquire('ada')).toBeUndefined();
	});
});
