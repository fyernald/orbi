'use client';

import type { CreateInteractiveInput } from '@orbi/shared';
import { lazy, Suspense } from 'react';
import { cn } from '@/lib/utils';
import type { InteractiveState } from '../../../visuals/use-interactive';
import { InteractiveControls } from './interactive-controls';
import { InteractiveReadouts } from './interactive-readouts';
import { PlotPlaceholder } from './plot-placeholder';

// Recharts loads with the first chart in a chat
const InteractiveChart = lazy(() => import('./interactive-chart'));

type InteractiveBodyProps = {
	tool: CreateInteractiveInput;
	state: InteractiveState;
	large?: boolean;
};

// An interactive tool's controls, chart and results. In the chat they stack:
// controls, then the chart they move, then the results. Full screen on a wide
// screen, the controls and results sit in a column beside the chart.
export function InteractiveBody({ tool, state, large }: InteractiveBodyProps) {
	const readouts = tool.values?.length ? (
		<InteractiveReadouts values={tool.values} scope={state.scope} />
	) : null;
	return (
		<div className="@container">
			<div
				className={cn(
					'flex flex-col gap-5',
					large &&
						'@3xl:grid @3xl:grid-cols-[18rem_1fr] @3xl:items-start @3xl:gap-8'
				)}
			>
				<div className="flex flex-col gap-5">
					<InteractiveControls
						controls={tool.controls}
						values={state.controls}
						onChange={state.setControl}
					/>
					{large && readouts}
				</div>
				{tool.chart && (
					<Suspense fallback={<PlotPlaceholder />}>
						<InteractiveChart
							chart={tool.chart}
							compiled={state.compiled}
							scope={state.scope}
							large={large}
						/>
					</Suspense>
				)}
				{!large && readouts}
			</div>
		</div>
	);
}
