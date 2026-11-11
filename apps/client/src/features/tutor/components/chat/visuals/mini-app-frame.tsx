'use client';

import type { MiniAppCode } from '@orbi/shared';
import { cn } from '@/lib/utils';
import { frameHeight } from '../../../visuals/mini-app-frame-state';
import { useMiniAppFrame } from '../../../visuals/use-mini-app-frame';
import { Thinking } from '../thinking';
import { MiniAppStopped } from './mini-app-stopped';

export type SandboxAddress = { url: string; origin: string };

type MiniAppFrameProps = {
	app: MiniAppCode;
	title: string;
	sandbox: SandboxAddress;
	maxHeight?: number;
	onTryAgain: () => void;
};

// One run of a mini-app. The frame is sandboxed with scripts only: no
// allow-same-origin, so it gets an origin of its own even inside the sandbox page,
// and no forms, popups or top navigation. It stays hidden until the app is ready.
export function MiniAppFrame({
	app,
	title,
	sandbox,
	maxHeight,
	onTryAgain,
}: MiniAppFrameProps) {
	const { state, onLoad } = useMiniAppFrame(app);

	if (state.phase === 'failed') {
		return (
			<MiniAppStopped
				failure={state.failure}
				detail={state.detail}
				onTryAgain={onTryAgain}
			/>
		);
	}
	const running = state.phase === 'running';
	return (
		<div className="relative">
			<iframe
				src={sandbox.url}
				title={title}
				sandbox="allow-scripts"
				referrerPolicy="no-referrer"
				loading="lazy"
				onLoad={onLoad}
				className={cn(
					'block w-full rounded-lg border-0 transition-opacity motion-reduce:transition-none',
					!running && 'opacity-0'
				)}
				style={{ height: frameHeight(state.height, maxHeight) }}
			/>
			{!running && (
				<div
					role="status"
					className="absolute inset-0 grid place-items-center rounded-lg bg-muted/40"
				>
					<Thinking label="Starting the mini-app…" className="text-xs" />
				</div>
			)}
			{running && state.lateError && (
				<p className="mt-2 font-mono text-xs break-all text-muted-foreground">
					Something in the mini-app went wrong: {state.lateError}
				</p>
			)}
		</div>
	);
}
