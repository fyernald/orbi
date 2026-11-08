import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { browserBarColors } from './browser-bar';

const css = readFileSync(
	new URL('../app/globals.css', import.meta.url),
	'utf8'
);

// the --background of the first `selector {` block in globals.css
function background(selector: string): string | undefined {
	const start = css.indexOf(`\n${selector} {`);
	const block = css.slice(start, css.indexOf('\n}', start));
	return block.match(/--background:\s*([^;]+);/)?.[1]?.trim();
}

describe('browserBarColors', () => {
	it('matches the background of each theme', () => {
		expect(browserBarColors).toEqual({
			light: background(':root'),
			dark: background('.dark'),
		});
	});
});
