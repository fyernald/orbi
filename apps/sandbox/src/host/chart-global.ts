// The parts of the Chart.js global the sandbox uses, typed by hand: Chart.js is
// loaded as a plain script for the mini-app, so its own types are not imported.

type Colored = { color: unknown };

export type ChartInstance = {
	canvas: HTMLCanvasElement;
	options: { responsive?: boolean; maintainAspectRatio?: boolean };
	data: { datasets: Record<string, unknown>[] };
	update: () => void;
};

export type ChartPlugin = {
	id: string;
	beforeInit?: (chart: ChartInstance) => void;
	beforeUpdate?: (chart: ChartInstance) => void;
};

export type ChartGlobal = {
	defaults: {
		color: string;
		borderColor: string;
		backgroundColor: string;
		font: { family: string };
		scale: {
			grid: Colored;
			border: Colored;
			ticks: Colored;
			title: Colored;
		};
		plugins: { legend: { labels: Colored }; title: Colored };
	};
	register: (plugin: ChartPlugin) => void;
	instances: Record<string, ChartInstance>;
};

export const chartGlobal = () =>
	(window as unknown as { Chart?: ChartGlobal }).Chart;
