import { describe, expect, it } from 'vitest';
import { miniAppSource } from './mini-app-source';

describe('miniAppSource', () => {
	it('puts the parts together as one HTML file', () => {
		expect(
			miniAppSource({
				title: 'Bubble sort',
				html: '<div id="bars"></div>',
				css: '#bars { display: flex; }',
				js: 'draw();',
				libraries: ['d3'],
				description: 'Bars that swap.',
			})
		).toBe(
			[
				'<!-- Bubble sort -->',
				'<!-- uses: d3 -->',
				'<style>\n#bars { display: flex; }\n</style>',
				'<div id="bars"></div>',
				'<script>\ndraw();\n</script>',
			].join('\n\n')
		);
	});

	it('leaves out the parts the app does not have', () => {
		expect(
			miniAppSource({ title: 'Clock', js: 'tick();', description: 'A clock.' })
		).toBe('<!-- Clock -->\n\n<script>\ntick();\n</script>');
	});

	it('keeps a title from closing its comment early', () => {
		expect(
			miniAppSource({ title: 'a --> b', js: 'x', description: 'd' })
		).toMatch(/^<!-- a -> b -->/);
	});
});
