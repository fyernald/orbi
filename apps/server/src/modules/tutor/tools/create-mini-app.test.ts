import { describe, expect, it } from 'vitest';
import { jsSyntaxProblem } from './js-syntax';

describe('jsSyntaxProblem', () => {
	it('accepts code that parses', () => {
		expect(
			jsSyntaxProblem('const items = [3, 1, 2];\nitems.sort((a, b) => a - b);')
		).toBeUndefined();
	});

	it('names the syntax error so the AI can fix it', () => {
		expect(jsSyntaxProblem('function go( {')).toMatch(
			/^The js has a syntax error: .+\. Fix it and call the tool again\.$/
		);
	});

	it('never runs the code', () => {
		const globals = globalThis as { ranMiniApp?: boolean };

		expect(jsSyntaxProblem('globalThis.ranMiniApp = true;')).toBeUndefined();
		expect(globals.ranMiniApp).toBeUndefined();
	});
});
