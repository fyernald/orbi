import type { ComponentProps } from 'react';
import { CartesianGrid, XAxis, YAxis } from 'recharts';
import { formatNumber } from '../../../visuals/number-format';

type AxisDomain = ComponentProps<typeof XAxis>['domain'];

type AxesProps = {
	xLabel?: string;
	yLabel?: string;
	// labels along x (bar, line), or numbers (scatter, function plots)
	xType: 'category' | 'number';
	xKey: string;
	// scatter points carry their y; other charts give it per series
	yKey?: string;
	xDomain?: AxisDomain;
	yDomain?: AxisDomain;
	// keep the given y range even when a curve runs past it
	clipY?: boolean;
};

// room above the plot for the y axis name and under it for the x axis name
export const AXES_MARGIN = { top: 28, right: 12, bottom: 20, left: 4 };

// how far above the plot the y axis name sits
const Y_NAME_RISE = 16;

type AxisBox = { viewBox?: { x?: number; y?: number } };

// The y axis name above its numbers, written left to right: a long name like
// "DNA amount (arbitrary units)" would not fit turned on its side beside a short
// chart.
const yAxisName =
	(name: string) =>
	({ viewBox }: AxisBox) => (
		<text
			x={viewBox?.x ?? 0}
			y={(viewBox?.y ?? 0) - Y_NAME_RISE}
			className="recharts-label"
			fontSize={12}
			textAnchor="start"
			dominantBaseline="middle"
		>
			{name}
		</text>
	);

const formatTick = (value: unknown) =>
	typeof value === 'number' ? formatNumber(value) : String(value);

// The grid and both axes every x/y chart shares: hairline rows only, no axis
// lines or tick marks, and each axis named. Returned as a list, since
// Recharts reads its parts from the chart's children.
export function chartAxes({
	xLabel,
	yLabel,
	xType,
	xKey,
	yKey,
	xDomain,
	yDomain,
	clipY,
}: AxesProps) {
	return [
		<CartesianGrid key="grid" vertical={false} />,
		<XAxis
			key="x"
			dataKey={xKey}
			type={xType}
			domain={xDomain}
			name={xLabel}
			tickLine={false}
			axisLine={false}
			tickMargin={8}
			minTickGap={16}
			tickFormatter={formatTick}
			label={{ value: xLabel, position: 'bottom', offset: 4 }}
		/>,
		<YAxis
			key="y"
			type="number"
			dataKey={yKey}
			domain={yDomain}
			allowDataOverflow={clipY}
			name={yLabel}
			width={44}
			tickLine={false}
			axisLine={false}
			tickFormatter={formatTick}
			label={yLabel ? yAxisName(yLabel) : undefined}
		/>,
	];
}
