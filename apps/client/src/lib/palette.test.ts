import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { browserBarColors } from './browser-bar';
import { PALETTES, readPalette } from './palette';

const css = readFileSync(
	new URL('../app/globals.css', import.meta.url),
	'utf8'
);

// the tokens of the first `selector {` block in globals.css
function tokens(selector: string): Record<string, string> {
	const start = css.indexOf(`\n${selector} {`);
	expect(start, `${selector} in globals.css`).toBeGreaterThan(-1);
	const block = css.slice(start, css.indexOf('\n}', start));
	return Object.fromEntries(
		[...block.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [
			name,
			value!.trim(),
		])
	);
}

const light = (palette: string) =>
	tokens(palette === 'berry' ? ':root' : `:root[data-palette='${palette}']`);
const dark = (palette: string) =>
	tokens(
		palette === 'berry' ? '.dark' : `:root.dark[data-palette='${palette}']`
	);

describe('colour themes', () => {
	it.each(PALETTES)('%s: the browser bar matches the background', (palette) => {
		expect(browserBarColors[palette]).toEqual({
			light: light(palette).background,
			dark: dark(palette).background,
		});
	});

	// a token set only in light mode would stay in dark mode too
	it.each(PALETTES.filter((palette) => palette !== 'berry'))(
		'%s: sets the same tokens in both modes',
		(palette) => {
			expect(Object.keys(dark(palette)).sort()).toEqual(
				Object.keys(light(palette)).sort()
			);
		}
	);

	it.each(PALETTES)('%s: has a colour for its swatch', (palette) => {
		expect(tokens(':root')[`palette-${palette}`]).toBeDefined();
		expect(tokens('.dark')[`palette-${palette}`]).toBeDefined();
	});
});

describe('readPalette', () => {
	it('reads a known colour theme and falls back to Berry', () => {
		expect(readPalette('forest')).toBe('forest');
		expect(readPalette('neon')).toBe('berry');
		expect(readPalette(undefined)).toBe('berry');
	});
});
