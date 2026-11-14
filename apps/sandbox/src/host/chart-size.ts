import { chartGlobal, type ChartInstance } from './chart-global';

// A responsive chart with maintainAspectRatio: false takes its parent's height.
// When that parent is only as tall as its content, the chart and the parent make
// each other taller on every resize, and the mini-app grows to the frame's limit.
// Such a canvas is moved into a box of its own with a fixed height before the
// chart first sizes itself.

const BOX_HEIGHT = { fallback: 240, min: 160, max: 400 };

// the height the canvas asked for, or a chart-sized default
export function chartBoxHeight(heightAttribute: string | null) {
	const asked = Number(heightAttribute);
	if (!heightAttribute || !Number.isFinite(asked) || asked <= 0) {
		return BOX_HEIGHT.fallback;
	}
	return Math.min(BOX_HEIGHT.max, Math.max(BOX_HEIGHT.min, Math.round(asked)));
}

const takesParentHeight = ({ options }: ChartInstance) =>
	options.responsive !== false && options.maintainAspectRatio === false;

// whether the parent shrinks without the canvas, so its height comes from it
function parentFollowsCanvas(canvas: HTMLCanvasElement, parent: HTMLElement) {
	const withCanvas = parent.getBoundingClientRect().height;
	const display = canvas.style.display;
	canvas.style.display = 'none';
	const without = parent.getBoundingClientRect().height;
	canvas.style.display = display;
	return without < withCanvas;
}

function boxCanvas(canvas: HTMLCanvasElement) {
	const parent = canvas.parentElement;
	if (!parent || !parentFollowsCanvas(canvas, parent)) return;
	const box = document.createElement('div');
	box.style.position = 'relative';
	box.style.height = `${chartBoxHeight(canvas.getAttribute('height'))}px`;
	parent.insertBefore(box, canvas);
	box.append(canvas);
}

// once, when Chart.js has loaded
export function setUpChartSize() {
	chartGlobal()?.register({
		id: 'orbiChartBox',
		beforeInit: (chart) => {
			if (takesParentHeight(chart)) boxCanvas(chart.canvas);
		},
	});
}
