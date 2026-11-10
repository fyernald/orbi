import { CHART_SERIES_MAX } from '@orbi/shared';

// Each series takes the next chart colour in the fixed order, so the same chart
// always looks the same. The tokens follow light and dark mode by themselves.
export const seriesKey = (index: number) => `s${index}`;

export const chartColor = (index: number) =>
	`var(--chart-${(index % CHART_SERIES_MAX) + 1})`;

// the shaded area under series `index`, drawn in its colour
export const shadeKey = (index: number) => `${seriesKey(index)}Shade`;
