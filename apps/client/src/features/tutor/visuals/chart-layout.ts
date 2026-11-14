// The room a chart's parts take, used to decide how to lay it out before it draws.

// room above the plot for the y axis name and under it for the x axis name
export const AXES_MARGIN = { top: 28, right: 12, bottom: 20, left: 4 };

// the column of numbers beside a value axis
export const VALUE_AXIS_WIDTH = 44;

// the numbers and name under a horizontal value axis
const BOTTOM_AXIS_HEIGHT = 30;

// a rough width per character of the charts' 12px text
const CHARACTER_WIDTH = 7;

// the space a label needs from the one beside it
const LABEL_GAP = 8;

export const textWidth = (text: string) => text.length * CHARACTER_WIDTH;

const widestLabel = (labels: string[]) => Math.max(0, ...labels.map(textWidth));

// the room between the y axis numbers and the right edge of a chart `width` wide
const plotWidth = (width: number) =>
	width - VALUE_AXIS_WIDTH - AXES_MARGIN.left - AXES_MARGIN.right;

// the room each number along a horizontal number axis gets
const NUMBER_ROOM = 40;

// How many steps a horizontal number axis can mark in a chart `width` wide, every
// one with its number shown: 6 on a wide chart, 3 on a phone, never fewer than 2.
export const numberAxisSteps = (width: number) =>
	Math.min(6, Math.max(2, Math.floor(plotWidth(width) / NUMBER_ROOM)));

// Whether every label fits side by side under the bars of a chart `width` wide.
// When they do not, Recharts hides some, and a reader can no longer tell which
// bar is which.
export function labelsFitAcross(labels: string[], width: number): boolean {
	if (labels.length === 0) return true;
	return widestLabel(labels) + LABEL_GAP <= plotWidth(width) / labels.length;
}

// the column of names beside bars laid in rows: as wide as the longest name, up to
// 40% of the chart
export function labelColumnWidth(labels: string[], width: number): number {
	return Math.round(
		Math.min(widestLabel(labels) + LABEL_GAP, Math.max(width * 0.4, 48))
	);
}

// A name cut to `width` with an ellipsis; the tooltip and table give it in full.
export function fitLabel(label: string, width: number): string {
	if (textWidth(label) <= width) return label;
	const characters = Math.max(1, Math.floor(width / CHARACTER_WIDTH) - 1);
	return `${label.slice(0, characters).trimEnd()}…`;
}

// The height of bars laid in rows: a row per label, tall enough for one bar of
// each series, so the chart grows with its labels instead of squeezing them.
export function barRowsHeight(labelCount: number, seriesCount: number): number {
	const rowHeight = Math.max(32, seriesCount * 12 + 16);
	return (
		AXES_MARGIN.top +
		AXES_MARGIN.bottom +
		BOTTOM_AXIS_HEIGHT +
		labelCount * rowHeight
	);
}
