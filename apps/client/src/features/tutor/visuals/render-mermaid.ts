import { DIAGRAM_SOURCE_MAX_LENGTH } from '@orbi/shared';
import { mermaidThemeVariables, withColourClasses } from './mermaid-theme';
import { readThemeTokens } from './theme-tokens';

// Mermaid is large, so it loads with the first diagram in a chat, not with the page.
// Strict security encodes HTML in labels and turns off click handlers; labels are
// plain SVG text, so a diagram can also be saved as a PNG.
export async function renderMermaid(
	source: string,
	id: string,
	dark: boolean
): Promise<string> {
	const { default: mermaid } = await import('mermaid');
	const tokens = readThemeTokens();
	mermaid.initialize({
		startOnLoad: false,
		securityLevel: 'strict',
		theme: 'base',
		themeVariables: mermaidThemeVariables(tokens, dark),
		fontFamily: tokens.fontFamily,
		htmlLabels: false,
		// the source plus the colour classes added here
		maxTextSize: DIAGRAM_SOURCE_MAX_LENGTH * 2,
		// a broken diagram throws, so the chat shows its own error card
		suppressErrorRendering: true,
	});
	const { svg } = await mermaid.render(id, withColourClasses(source, tokens));
	return svg;
}
