import { describe, expect, it } from 'vitest';
import { mermaidThemeVariables, withColourClasses } from './mermaid-theme';
import type { ThemeTokens } from './theme-tokens';

const light: ThemeTokens = {
	card: '#ffffff',
	foreground: '#1f1519',
	mutedForeground: '#6c5f65',
	muted: '#f4eef1',
	border: '#e8e1e4',
	charts: ['#c61d78', '#2a78d6', '#1baf7a', '#eda100', '#6250d6', '#eb6834'],
	fontFamily: 'Inter',
};

describe('mermaidThemeVariables', () => {
	const theme = mermaidThemeVariables(light, false);

	it('draws nodes as soft tints with a border in the chart colour', () => {
		expect(theme.primaryBorderColor).toBe('#c61d78');
		expect(theme.primaryColor).not.toBe('#c61d78');
		expect(theme.primaryColor).toMatch(/^#[0-9a-f]{6}$/);
		expect(theme.secondaryBorderColor).toBe('#2a78d6');
	});

	it('writes every label in the normal ink, never in a chart colour', () => {
		expect(theme.primaryTextColor).toBe('#1f1519');
		expect(theme.nodeTextColor).toBe('#1f1519');
		expect(theme.cScaleLabel0).toBe('#1f1519');
		expect(theme.cScaleLabel11).toBe('#1f1519');
	});

	it('gives mind map branches the chart colours in order, starting again after six', () => {
		expect(theme.cScalePeer0).toBe('#c61d78');
		expect(theme.cScalePeer5).toBe('#eb6834');
		expect(theme.cScalePeer6).toBe('#c61d78');
	});

	it('tells Mermaid about dark mode', () => {
		expect(mermaidThemeVariables(light, true).darkMode).toBe(true);
	});
});

describe('withColourClasses', () => {
	it('adds the classes c1 to c6 in the chart colours to a flowchart', () => {
		const source = withColourClasses(
			'flowchart TD\n  A[Prophase]:::c2 --> B',
			light
		);
		const classes = source
			.split('\n')
			.filter((line) => line.startsWith('classDef'));

		expect(classes).toHaveLength(6);
		expect(classes[1]).toMatch(
			/^classDef c2 fill:#[0-9a-f]{6},stroke:#2a78d6,color:#1f1519$/
		);
	});

	it('leaves diagrams without node classes as they are', () => {
		const mindmap = 'mindmap\n  root((Cell))';

		expect(withColourClasses(mindmap, light)).toBe(mindmap);
	});
});
