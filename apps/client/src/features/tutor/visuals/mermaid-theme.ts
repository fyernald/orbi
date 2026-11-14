import {
	COLOURED_DIAGRAM_TYPES,
	DIAGRAM_COLOUR_CLASSES,
	mermaidDiagramType,
} from '@orbi/shared';
import { mixHex } from './colors';
import type { ThemeTokens } from './theme-tokens';

// mind maps and timelines give each branch the next colour of this scale
const SCALE_SIZE = 12;
const NODE_TINT = 0.16;
const BRANCH_TINT = 0.24;

// Mermaid's themeVariables: colours as #rrggbb, plus darkMode
export type MermaidThemeVariables = Record<string, string | boolean>;

// Mermaid's base theme in Orbi's colours: soft tinted fills with a coloured
// border, and text in the normal ink, so a label never depends on its colour.
export function mermaidThemeVariables(
	tokens: ThemeTokens,
	dark: boolean
): MermaidThemeVariables {
	const { card, foreground: text, mutedForeground: line } = tokens;
	const chart = (index: number) => tokens.charts[index % tokens.charts.length]!;
	const tint = (index: number, weight = NODE_TINT) =>
		mixHex(chart(index), card, weight);

	const scale: Record<string, string> = {};
	for (let index = 0; index < SCALE_SIZE; index += 1) {
		scale[`cScale${index}`] = tint(index, BRANCH_TINT);
		scale[`cScalePeer${index}`] = chart(index);
		scale[`cScaleLabel${index}`] = text;
	}

	return {
		darkMode: dark,
		background: card,
		fontFamily: tokens.fontFamily,
		fontSize: '14px',
		textColor: text,
		titleColor: text,
		lineColor: line,
		defaultLinkColor: line,
		edgeLabelBackground: card,
		primaryColor: tint(0),
		primaryBorderColor: chart(0),
		primaryTextColor: text,
		secondaryColor: tint(1),
		secondaryBorderColor: chart(1),
		secondaryTextColor: text,
		tertiaryColor: tint(2),
		tertiaryBorderColor: chart(2),
		tertiaryTextColor: text,
		mainBkg: tint(0),
		nodeBorder: chart(0),
		nodeTextColor: text,
		clusterBkg: tokens.muted,
		clusterBorder: tokens.border,
		noteBkgColor: tint(3, BRANCH_TINT),
		noteBorderColor: chart(3),
		noteTextColor: text,
		actorBkg: tint(0),
		actorBorder: chart(0),
		actorTextColor: text,
		actorLineColor: line,
		signalColor: text,
		signalTextColor: text,
		labelBoxBkgColor: tint(1),
		labelBoxBorderColor: chart(1),
		labelTextColor: text,
		loopTextColor: text,
		activationBkgColor: tint(2),
		activationBorderColor: chart(2),
		sequenceNumberColor: card,
		attributeBackgroundColorOdd: card,
		attributeBackgroundColorEven: tokens.muted,
		...scale,
	};
}

// The classes c1 to c6 in the chart colours, added to a diagram that can use them,
// so the AI colours groups of nodes by name and they still follow the theme.
export function withColourClasses(source: string, tokens: ThemeTokens): string {
	const type = mermaidDiagramType(source);
	if (
		!(COLOURED_DIAGRAM_TYPES as readonly (string | undefined)[]).includes(type)
	) {
		return source;
	}
	const classes = tokens.charts
		.slice(0, DIAGRAM_COLOUR_CLASSES)
		.map((colour, index) => {
			const fill = mixHex(colour, tokens.card, NODE_TINT);
			return `classDef c${index + 1} fill:${fill},stroke:${colour},color:${tokens.foreground}`;
		});
	return [source, ...classes].join('\n');
}
