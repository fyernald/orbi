import { describe, expect, it } from 'vitest';
import { chartSvgDocument, escapeXml, withGenericFont } from './chart-svg';
import { svgSize } from './svg-image';

const tokens = {
	card: '#ffffff',
	foreground: '#1f1519',
	mutedForeground: '#6c5f65',
	fontFamily: 'Inter, sans-serif',
};

describe('chartSvgDocument', () => {
	it('puts the title and the legend above the chart', () => {
		const svg = chartSvgDocument({
			inner: '<rect width="10" height="10"/>',
			width: 400,
			height: 200,
			title: 'Marks <2026>',
			keys: [
				{ name: 'Maths', color: '#c61d78' },
				{ name: 'Biology', color: '#2a78d6' },
			],
			tokens,
		});

		expect(svg).toContain('Marks &lt;2026&gt;');
		expect(svg).toContain('<rect width="100%" height="100%" fill="#ffffff"/>');
		expect(svg).toContain('fill="#c61d78"');
		expect(svg).toContain('>Biology</text>');
		expect(svg).toContain('<g transform="translate(16 64)">');
		// the PNG export reads the size from the viewBox
		expect(svgSize(svg)).toEqual({ width: 432, height: 280 });
	});

	it('wraps a long legend onto more rows', () => {
		const keys = Array.from({ length: 6 }, (_, index) => ({
			name: `A long series name ${index}`,
			color: '#000000',
		}));

		const svg = chartSvgDocument({
			inner: '',
			width: 300,
			height: 100,
			title: 'Many',
			keys,
			tokens,
		});

		expect(svgSize(svg)!.height).toBeGreaterThan(100 + 16 + 28 + 20 * 2);
	});

	it('ends the font list in a generic family', () => {
		expect(withGenericFont('Inter, "Inter Fallback"')).toBe(
			'Inter, "Inter Fallback", sans-serif'
		);
		expect(withGenericFont('Inter, sans-serif')).toBe('Inter, sans-serif');
	});

	it('escapes text for XML', () => {
		expect(escapeXml('a & "b"')).toBe('a &amp; &quot;b&quot;');
	});
});
