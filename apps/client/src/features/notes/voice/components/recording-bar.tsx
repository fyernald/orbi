'use client';

import { Mic, Square } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { formatDuration } from '../recording';

type RecordingBarProps = {
	seconds: number;
	maxSeconds: number;
	onStop: () => void;
	onCancel: () => void;
};

// near the end, screen readers hear how much time is left
const LAST_SECONDS = 30;

// what shows while the microphone records: that it records, for how long, and
// the buttons to stop (and write the note) or cancel (and drop the recording)
export function RecordingBar({
	seconds,
	maxSeconds,
	onStop,
	onCancel,
}: RecordingBarProps) {
	const stop = useRef<HTMLButtonElement>(null);
	// the Record button is gone, so the focus moves to Stop
	useEffect(() => stop.current?.focus(), []);
	const nearTheEnd = maxSeconds - seconds <= LAST_SECONDS;

	return (
		<div className="flex items-center gap-3">
			<span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-tone-red text-tone-red-foreground">
				<Mic className="size-4" />
			</span>
			<div className="flex min-w-0 flex-1 flex-col gap-0.5">
				<span className="flex items-center gap-2 text-sm font-medium">
					<span
						aria-hidden="true"
						className="size-2 rounded-full bg-destructive motion-safe:animate-pulse"
					/>
					Recording
				</span>
				<span className="text-xs text-muted-foreground tabular-nums">
					{formatDuration(seconds)} / {formatDuration(maxSeconds)}
				</span>
			</div>
			<p aria-live="polite" className="sr-only">
				{nearTheEnd
					? `${LAST_SECONDS} seconds left. The recording stops at ${formatDuration(maxSeconds)}.`
					: `Recording, up to ${maxSeconds / 60} minutes. Press Stop when you are done.`}
			</p>
			<Button
				type="button"
				variant="ghost"
				onClick={onCancel}
				className="h-8 shrink-0 rounded-lg px-3"
			>
				Cancel
			</Button>
			<Button
				ref={stop}
				type="button"
				onClick={onStop}
				className="h-8 shrink-0 rounded-lg px-3"
			>
				<Square className="fill-current" />
				Stop
			</Button>
		</div>
	);
}
