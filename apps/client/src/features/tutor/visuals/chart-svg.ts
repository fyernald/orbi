import { textWidth } from './chart-layout';
import { readThemeTokens, type ThemeTokens } from './theme-tokens';

// one entry of a chart's legend, with its colour as #rrggbb
export type ChartKeyItem = { name: string; color: string };

const PADDING = 16;
const TITLE_HEIGHT = 28;
const KEY_ROW_HEIGHT = 20;
const KEY_SWATCH = 10;
const KEY_GAP = 16;

// A saved SVG cannot load the page's web font, so the font list ends in a generic
// family; without one, viewers fall back to a serif font.
export const withGenericFont = (family: string) =>
	/(^|,)\s*(sans-serif|serif|monospace|system-ui)\s*$/.test(family)
		? family
		: `${family}, sans-serif`;

export const escapeXml = (text: string) =>
	text
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;');

type Placed = ChartKeyItem & { x: number; row: number };

// the legend laid out left to right, wrapping onto a new row when it is full
function placeKeys(keys: ChartKeyItem[], width: number): Placed[] {
	let x = 0;
	let row = 0;
	return keys.map((key) => {
		const itemWidth = KEY_SWATCH + 6 + textWidth(key.name) + KEY_GAP;
		if (x > 0 && x + itemWidth > width) {
			x = 0;
			row += 1;
		}
		const placed = { ...key, x, row };
		x += itemWidth;
		return placed;
	});
}

export type ChartSvgParts = {
	// the chart's own SVG content, with its colours written in
	inner: string;
	width: number;
	height: number;
	title: string;
	keys: ChartKeyItem[];
	tokens: Pick<
		ThemeTokens,
		'card' | 'foreground' | 'mutedForeground' | 'fontFamily'
	>;
};

// A chart as an SVG file of its own: the title, the legend, then the chart, so the
// download still says what it shows away from the chat. It keeps the card behind
// it, so a dark mode chart stays readable in a light viewer.
export function chartSvgDocument({
	inner,
	width,
	height,
	title,
	keys,
	tokens,
}: ChartSvgParts): string {
	const placed = placeKeys(keys, width);
	const keyRows = placed.length ? (placed.at(-1)?.row ?? 0) + 1 : 0;
	const chartTop = PADDING + TITLE_HEIGHT + keyRows * KEY_ROW_HEIGHT;
	const fullWidth = width + PADDING * 2;
	const fullHeight = chartTop + height + PADDING;
	const legend = placed.map(({ name, color, x, row }) => {
		const left = PADDING + x;
		const top = PADDING + TITLE_HEIGHT + row * KEY_ROW_HEIGHT;
		return [
			`<rect x="${left}" y="${top}" width="${KEY_SWATCH}" height="${KEY_SWATCH}" rx="2" fill="${escapeXml(color)}"/>`,
			`<text x="${left + KEY_SWATCH + 6}" y="${top + 9}" font-size="12" fill="${escapeXml(tokens.mutedForeground)}">${escapeXml(name)}</text>`,
		].join('');
	});
	return [
		`<svg xmlns="http://www.w3.org/2000/svg" width="${fullWidth}" height="${fullHeight}" viewBox="0 0 ${fullWidth} ${fullHeight}" font-family="${escapeXml(withGenericFont(tokens.fontFamily))}">`,
		`<rect width="100%" height="100%" fill="${escapeXml(tokens.card)}"/>`,
		`<text x="${PADDING}" y="${PADDING + 15}" font-size="15" font-weight="600" fill="${escapeXml(tokens.foreground)}">${escapeXml(title)}</text>`,
		...legend,
		`<g transform="translate(${PADDING} ${chartTop})">${inner}</g>`,
		'</svg>',
	].join('');
}

// colour attributes Recharts writes as CSS variables, like fill="var(--color-s0)"
const COLOUR_ATTRIBUTES = ['fill', 'stroke'];

// the styles that decide how a chart looks once it is out of the page
const DRAWN_STYLES = [
	'fill',
	'fill-opacity',
	'stroke',
	'stroke-width',
	'stroke-opacity',
	'stroke-dasharray',
	'opacity',
	'font-family',
	'font-size',
	'font-weight',
	'text-anchor',
	'dominant-baseline',
];

// The SVG's content with every colour and font written onto each element. On the
// page they come from CSS variables and classes, which a saved file does not have.
export function inlineDrawnStyles(svg: SVGSVGElement): string {
	const copy = svg.cloneNode(true) as SVGSVGElement;
	const originals = svg.querySelectorAll('*');
	copy.querySelectorAll('*').forEach((element, index) => {
		const original = originals[index];
		if (!original || !(element instanceof SVGElement)) return;
		const computed = getComputedStyle(original);
		for (const name of DRAWN_STYLES) {
			element.style.setProperty(name, computed.getPropertyValue(name));
		}
		element.style.setProperty(
			'font-family',
			withGenericFont(computed.getPropertyValue('font-family'))
		);
		for (const name of COLOUR_ATTRIBUTES) {
			if (element.getAttribute(name)?.includes('var(')) {
				element.setAttribute(name, computed.getPropertyValue(name));
			}
		}
		element.removeAttribute('class');
	});
	return copy.innerHTML;
}

// The chart on screen in `container` as an SVG file, in the colours of the theme
// on screen now. The legend takes the chart colours in order, like the chart.
export function readChartSvg(
	container: HTMLElement | null,
	title: string,
	keyNames: string[]
): string | undefined {
	const svg = container?.querySelector<SVGSVGElement>('svg.recharts-surface');
	if (!svg) return undefined;
	const { width, height } = svg.getBoundingClientRect();
	const tokens = readThemeTokens();
	return chartSvgDocument({
		inner: inlineDrawnStyles(svg),
		width: Math.round(width),
		height: Math.round(height),
		title,
		keys: keyNames.map((name, index) => ({
			name,
			color: tokens.charts[index % tokens.charts.length]!,
		})),
		tokens,
	});
}
