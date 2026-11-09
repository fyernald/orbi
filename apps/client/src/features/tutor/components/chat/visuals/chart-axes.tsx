import type { ComponentProps } from 'react';
import { CartesianGrid, XAxis, YAxis } from 'recharts';
import { fitLabel, VALUE_AXIS_WIDTH } from '../../../visuals/chart-layout';
import type { Scale } from '../../../visuals/nice-scale';
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
	// round numbers to mark along each axis
	xTicks?: number[];
	yTicks?: number[];
	// keep the given y range even when a curve runs past it
	clipY?: boolean;
};

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

// the shared look of every axis: no axis line or tick marks
const quietAxis = { tickLine: false, axisLine: false } as const;

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
	xTicks,
	yTicks,
	clipY,
}: AxesProps) {
	return [
		<CartesianGrid key="grid" vertical={false} />,
		<XAxis
			key="x"
			{...quietAxis}
			dataKey={xKey}
			type={xType}
			domain={xDomain}
			ticks={xTicks}
			// round ticks are sized to the chart, so each keeps its number
			interval={xTicks ? 0 : undefined}
			name={xLabel}
			tickMargin={8}
			minTickGap={16}
			tickFormatter={formatTick}
			label={{ value: xLabel, position: 'bottom', offset: 4 }}
		/>,
		<YAxis
			key="y"
			{...quietAxis}
			type="number"
			dataKey={yKey}
			domain={yDomain}
			ticks={yTicks}
			allowDataOverflow={clipY}
			name={yLabel}
			width={VALUE_AXIS_WIDTH}
			tickFormatter={formatTick}
			label={yLabel ? yAxisName(yLabel) : undefined}
		/>,
	];
}

type BarRowAxesProps = {
	// the name of the labels, shown above them
	labelName?: string;
	// the name of the values, shown under them
	valueName?: string;
	values: Scale;
	// the width of the column of labels
	labelWidth: number;
};

// The axes of bars laid in rows: a name for every bar down the left, and the values
// along the bottom with a hairline up from each round number.
export function barRowAxes({
	labelName,
	valueName,
	values,
	labelWidth,
}: BarRowAxesProps) {
	return [
		<CartesianGrid key="grid" horizontal={false} />,
		<XAxis
			key="x"
			{...quietAxis}
			type="number"
			domain={values.domain}
			ticks={values.ticks}
			name={valueName}
			tickMargin={8}
			tickFormatter={formatTick}
			label={{ value: valueName, position: 'bottom', offset: 4 }}
		/>,
		<YAxis
			key="y"
			{...quietAxis}
			type="category"
			dataKey="label"
			name={labelName}
			width={labelWidth}
			interval={0}
			tickFormatter={(label: string) => fitLabel(label, labelWidth - 8)}
			label={labelName ? yAxisName(labelName) : undefined}
		/>,
	];
}
