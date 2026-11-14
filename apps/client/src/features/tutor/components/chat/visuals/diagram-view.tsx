'use client';

import type { CreateDiagramInput, DiagramKind } from '@orbi/shared';
import { Workflow } from 'lucide-react';
import { useState } from 'react';
import { streamedTitle } from '../../../visuals/streamed-title';
import { svgDownloads } from '../../../visuals/svg-downloads';
import { useMermaidSvg } from '../../../visuals/use-mermaid-svg';
import type { ToolViewProps } from '../tool-views';
import { DiagramSvg } from './diagram-svg';
import {
	CopySourceAction,
	DownloadAction,
	FullScreenAction,
} from './visual-actions';
import { VisualCard } from './visual-card';
import { VisualError } from './visual-error';
import { VisualFullScreen } from './visual-full-screen';
import { VisualSkeleton } from './visual-skeleton';

const kindLabels: Record<DiagramKind, string> = {
	flowchart: 'Flowchart',
	tree: 'Tree',
	mindmap: 'Mind map',
	sequence: 'Sequence diagram',
	state: 'State diagram',
	class: 'Class diagram',
	er: 'Entity relationship diagram',
	timeline: 'Timeline',
	graph: 'Graph',
};

// the createDiagram tool: a skeleton while Orbi writes it, then the drawn diagram
export function DiagramView({ part, onRetry }: ToolViewProps<'createDiagram'>) {
	if (part.state === 'output-error') {
		return (
			<VisualError
				kind="diagram"
				title={streamedTitle(part.input)}
				onRetry={onRetry}
			/>
		);
	}
	if (part.state !== 'output-available') {
		return <VisualSkeleton kind="diagram" title={streamedTitle(part.input)} />;
	}
	return <Diagram input={part.input} onRetry={onRetry} />;
}

function Diagram({
	input,
	onRetry,
}: {
	input: CreateDiagramInput;
	onRetry?: () => void;
}) {
	const { drawing, redraw } = useMermaidSvg(input.mermaid);
	const [fullScreen, setFullScreen] = useState(false);

	if (drawing.status === 'drawing') {
		return <VisualSkeleton kind="diagram" title={input.title} />;
	}
	if (drawing.status === 'failed') {
		// the last reply is asked again; an older one is drawn again
		return (
			<VisualError
				kind="diagram"
				title={input.title}
				onRetry={onRetry ?? redraw}
			/>
		);
	}

	return (
		<>
			<VisualCard
				title={input.title}
				label={kindLabels[input.kind]}
				icon={Workflow}
				description={input.description}
				toolbar={
					<>
						<CopySourceAction
							source={input.mermaid}
							label="Copy Mermaid source"
						/>
						<DownloadAction
							options={svgDownloads(() => drawing.svg, input.title)}
						/>
						<FullScreenAction onOpen={() => setFullScreen(true)} />
					</>
				}
			>
				<DiagramSvg svg={drawing.svg} />
			</VisualCard>
			<VisualFullScreen
				open={fullScreen}
				onOpenChange={setFullScreen}
				title={input.title}
				description={input.description}
			>
				<DiagramSvg svg={drawing.svg} large />
			</VisualFullScreen>
		</>
	);
}
