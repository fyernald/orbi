'use client';

import { miniAppCode, type CreateMiniAppInput } from '@orbi/shared';
import { AppWindow, RotateCcw, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { sandboxOrigin, sandboxUrl } from '@/lib/sandbox';
import { miniAppSource } from '../../../visuals/mini-app-source';
import { streamedTitle } from '../../../visuals/streamed-title';
import type { ToolViewProps } from '../tool-views';
import { MiniAppFrame, type SandboxAddress } from './mini-app-frame';
import {
	CopySourceAction,
	FullScreenAction,
	IconAction,
} from './visual-actions';
import { VisualCard } from './visual-card';
import { VisualError } from './visual-error';
import { VisualErrorBoundary } from './visual-error-boundary';
import { VisualFullScreen } from './visual-full-screen';
import { VisualSkeleton } from './visual-skeleton';

// full screen leaves room for a taller app than the chat does
const FULL_SCREEN_MAX_HEIGHT = 1200;

const sandbox: SandboxAddress | undefined =
	sandboxUrl && sandboxOrigin
		? { url: sandboxUrl, origin: sandboxOrigin }
		: undefined;

// the createMiniApp tool: a skeleton while Orbi writes it, then the app in its sandbox
export function MiniAppView({ part, onRetry }: ToolViewProps<'createMiniApp'>) {
	if (part.state === 'output-error') {
		return (
			<VisualError
				kind="miniApp"
				title={streamedTitle(part.input)}
				onRetry={onRetry}
			/>
		);
	}
	if (part.state !== 'output-available') {
		return <VisualSkeleton kind="miniApp" title={streamedTitle(part.input)} />;
	}
	if (!sandbox) {
		return (
			<VisualError
				kind="miniApp"
				title={part.input.title}
				message="Mini-apps are not set up on this server yet."
			/>
		);
	}
	return (
		<VisualErrorBoundary
			fallback={(redraw) => (
				<VisualError
					kind="miniApp"
					title={part.input.title}
					onRetry={onRetry ?? redraw}
				/>
			)}
		>
			<MiniApp tool={part.input} sandbox={sandbox} onRetry={onRetry} />
		</VisualErrorBoundary>
	);
}

type MiniAppProps = {
	tool: CreateMiniAppInput;
	sandbox: SandboxAddress;
	onRetry?: () => void;
};

// The app in its card. One copy runs at a time: opening full screen starts it
// there, and closing full screen starts it again in the chat.
function MiniApp({ tool, sandbox, onRetry }: MiniAppProps) {
	const app = useMemo(() => miniAppCode(tool), [tool]);
	const [run, setRun] = useState(0);
	const [fullScreen, setFullScreen] = useState(false);
	const restart = () => setRun((count) => count + 1);
	// a broken app is better asked for again; an older reply can only restart
	const tryAgain = onRetry ?? restart;
	const frame = (key: string, maxHeight?: number) => (
		<MiniAppFrame
			key={key}
			app={app}
			title={tool.title}
			sandbox={sandbox}
			maxHeight={maxHeight}
			onTryAgain={tryAgain}
		/>
	);

	return (
		<>
			<VisualCard
				title={tool.title}
				label="Mini-app"
				icon={AppWindow}
				description={tool.description}
				toolbar={
					<>
						<IconAction label="Restart" onClick={restart}>
							<RotateCcw />
						</IconAction>
						<CopySourceAction
							source={miniAppSource(tool)}
							label="Copy source"
						/>
						<FullScreenAction onOpen={() => setFullScreen(true)} />
					</>
				}
			>
				{fullScreen ? (
					<p className="text-sm text-muted-foreground">
						Running in full screen.
					</p>
				) : (
					frame(`chat-${run}`)
				)}
				<p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
					<ShieldCheck aria-hidden className="size-3.5 shrink-0" />
					Runs in a sandbox, with no internet and no access to your account.
				</p>
			</VisualCard>
			<VisualFullScreen
				open={fullScreen}
				onOpenChange={setFullScreen}
				title={tool.title}
				description={tool.description}
			>
				{fullScreen && frame(`full-${run}`, FULL_SCREEN_MAX_HEIGHT)}
			</VisualFullScreen>
		</>
	);
}
