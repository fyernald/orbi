'use client';

import type { CreateInteractiveInput } from '@orbi/shared';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useRef, useState } from 'react';
import { readChartSvg } from '../../../visuals/chart-svg';
import { streamedTitle } from '../../../visuals/streamed-title';
import { svgDownloads } from '../../../visuals/svg-downloads';
import { useInteractive } from '../../../visuals/use-interactive';
import type { ToolViewProps } from '../tool-views';
import { InteractiveBody } from './interactive-body';
import {
	CopySourceAction,
	DownloadAction,
	FullScreenAction,
	IconAction,
} from './visual-actions';
import { VisualCard } from './visual-card';
import { VisualError } from './visual-error';
import { VisualErrorBoundary } from './visual-error-boundary';
import { VisualFullScreen } from './visual-full-screen';
import { VisualSkeleton } from './visual-skeleton';

// the createInteractive tool: a skeleton while Orbi writes it, then the tool
export function InteractiveView({
	part,
	onRetry,
}: ToolViewProps<'createInteractive'>) {
	if (part.state === 'output-error') {
		return (
			<VisualError
				kind="interactive"
				title={streamedTitle(part.input)}
				onRetry={onRetry}
			/>
		);
	}
	if (part.state !== 'output-available') {
		return (
			<VisualSkeleton kind="interactive" title={streamedTitle(part.input)} />
		);
	}
	return (
		<VisualErrorBoundary
			fallback={(redraw) => (
				// the last reply is asked again; an older one is built again
				<VisualError
					kind="interactive"
					title={part.input.title}
					onRetry={onRetry ?? redraw}
				/>
			)}
		>
			<Interactive tool={part.input} />
		</VisualErrorBoundary>
	);
}

// The tool in its card. The card and full screen share one state, so a control
// moved in full screen stays where it is back in the chat.
function Interactive({ tool }: { tool: CreateInteractiveInput }) {
	const state = useInteractive(tool);
	const [fullScreen, setFullScreen] = useState(false);
	const body = useRef<HTMLDivElement>(null);
	const curveNames = tool.chart?.curves.map(({ name }) => name) ?? [];
	const readSvg = () =>
		readChartSvg(
			body.current,
			tool.title,
			curveNames.length > 1 ? curveNames : []
		);

	return (
		<>
			<VisualCard
				title={tool.title}
				label="Interactive tool"
				icon={SlidersHorizontal}
				description={tool.description}
				toolbar={
					<>
						<IconAction
							label="Reset"
							disabled={!state.moved}
							onClick={state.reset}
						>
							<RotateCcw />
						</IconAction>
						<CopySourceAction
							source={JSON.stringify(tool, null, 2)}
							label="Copy source"
						/>
						{tool.chart && (
							<DownloadAction options={svgDownloads(readSvg, tool.title)} />
						)}
						<FullScreenAction onOpen={() => setFullScreen(true)} />
					</>
				}
			>
				<div ref={body}>
					<InteractiveBody tool={tool} state={state} />
				</div>
			</VisualCard>
			<VisualFullScreen
				open={fullScreen}
				onOpenChange={setFullScreen}
				title={tool.title}
				description={tool.description}
			>
				<InteractiveBody tool={tool} state={state} large />
			</VisualFullScreen>
		</>
	);
}
