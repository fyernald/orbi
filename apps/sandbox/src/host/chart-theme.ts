import type { SandboxTheme } from '@orbi/shared/mini-app-protocol';
import { chartGlobal } from './chart-global';
import { resolveDatasetColors, type ColorMemory } from './css-colors';

// Chart.js in Orbi's theme. Chart.js keeps the colours it worked out when a chart
// was made, so the scale and legend colours are set as functions of the current
// theme: they are read again each time a chart updates, and a theme switch updates
// every chart.

let current: SandboxTheme | undefined;
const memory: ColorMemory = new WeakMap();

const readVariable = (name: string) =>
	getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// once, when Chart.js has loaded
export function setUpChartTheme() {
	const Chart = chartGlobal();
	if (!Chart) return;
	const text = () => current?.colors.mutedForeground;
	const line = () => current?.colors.border;
	const { scale, plugins } = Chart.defaults;
	scale.grid.color = line;
	scale.border.color = line;
	scale.ticks.color = text;
	scale.title.color = text;
	plugins.legend.labels.color = text;
	plugins.title.color = () => current?.colors.foreground;
	// a dataset coloured var(--orbi-chart-1) gets the colour itself, each update
	Chart.register({
		id: 'orbiColors',
		beforeUpdate: (chart) => {
			for (const dataset of chart.data.datasets) {
				resolveDatasetColors(dataset, readVariable, memory);
			}
		},
	});
}

// on every theme, the first one too
export function themeCharts(theme: SandboxTheme) {
	current = theme;
	const Chart = chartGlobal();
	if (!Chart) return;
	Chart.defaults.color = theme.colors.mutedForeground;
	Chart.defaults.borderColor = theme.colors.border;
	Chart.defaults.backgroundColor = theme.charts[0] ?? theme.colors.primary;
	Chart.defaults.font.family = theme.fontFamily;
	for (const chart of Object.values(Chart.instances)) chart.update();
}
