import { describe, expect, it } from 'vitest';
import {
	createMiniAppInput,
	MINI_APP_JS_MAX_LENGTH,
	miniAppCode,
	miniAppHtmlProblem,
} from './mini-app';

const bouncingBall = {
	title: 'A bouncing ball',
	html: '<canvas id="ball" width="300" height="200"></canvas>',
	css: 'canvas { background: var(--orbi-muted); }',
	js: 'const canvas = document.getElementById("ball");',
	libraries: ['p5'],
	description: 'A ball that falls and bounces, losing height each time.',
};

const messagesOf = (input: unknown) => {
	const result = createMiniAppInput.safeParse(input);
	return result.success
		? []
		: result.error.issues.map(({ message }) => message);
};

describe('createMiniAppInput', () => {
	it('takes a mini-app with markup, styles, code and a library', () => {
		expect(messagesOf(bouncingBall)).toEqual([]);
	});

	it('needs only a title, code and a description', () => {
		expect(
			messagesOf({ title: 'Clock', js: 'tick()', description: 'A clock.' })
		).toEqual([]);
	});

	it('refuses code that is too long or empty', () => {
		expect(
			messagesOf({
				...bouncingBall,
				js: 'x'.repeat(MINI_APP_JS_MAX_LENGTH + 1),
			})
		).toHaveLength(1);
		expect(messagesOf({ ...bouncingBall, js: '' })).toHaveLength(1);
	});

	it('refuses a library the sandbox does not have, or one named twice', () => {
		expect(messagesOf({ ...bouncingBall, libraries: ['jquery'] })).toHaveLength(
			1
		);
		expect(messagesOf({ ...bouncingBall, libraries: ['d3', 'd3'] })).toEqual([
			'Name each library once.',
		]);
	});

	it('says to move scripts out of the markup', () => {
		expect(
			messagesOf({ ...bouncingBall, html: '<div></div><script>go()</script>' })
		).toEqual(['Put all JavaScript in js. Script tags in html do not run.']);
	});
});

describe('miniAppHtmlProblem', () => {
	it('accepts body markup', () => {
		expect(
			miniAppHtmlProblem('<label>Speed <input type="range"></label>')
		).toBe(undefined);
	});

	it('refuses a whole page', () => {
		expect(miniAppHtmlProblem('<html><body></body></html>')).toMatch(
			/inside the body/
		);
		expect(miniAppHtmlProblem('<BODY class="x">')).toMatch(/inside the body/);
	});
});

describe('miniAppCode', () => {
	it('fills in the parts the model left out', () => {
		expect(miniAppCode({ title: 'T', js: 'go()', description: 'D' })).toEqual({
			html: '',
			css: '',
			js: 'go()',
			libraries: [],
		});
	});
});
