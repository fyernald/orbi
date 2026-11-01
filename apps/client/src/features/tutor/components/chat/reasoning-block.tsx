'use client';

import { useId, useState } from 'react';
import { cn } from '@/lib/utils';
import { thinkingLabel } from '../../thinking';
import { ReasoningText } from './reasoning-text';
import { ReasoningToggle } from './reasoning-toggle';

// What Orbi thought before it answered. It starts closed; the student can open
// it at any time, also while Orbi is still thinking, and read along.
export function ReasoningBlock({
	text,
	thinking,
	durationMs,
}: {
	text: string;
	thinking: boolean;
	durationMs: number | undefined;
}) {
	const [open, setOpen] = useState(false);
	const bodyId = useId();

	return (
		<div className="flex flex-col">
			<ReasoningToggle
				label={thinking ? 'Thinking…' : thinkingLabel(durationMs)}
				thinking={thinking}
				open={open}
				controls={bodyId}
				onToggle={() => setOpen((value) => !value)}
			/>
			{/* the rows grow from 0 to the text's height, so it opens smoothly */}
			<div
				id={bodyId}
				inert={!open}
				className={cn(
					'grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none',
					open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
				)}
			>
				<div className="min-h-0 overflow-hidden">
					<ReasoningText text={text} streaming={thinking} />
				</div>
			</div>
		</div>
	);
}
