import { cn } from '@/lib/utils';

// widths that look like real turns: a short question, then a longer reply
const turns = [
	{ question: 'w-2/5', reply: ['w-11/12', 'w-4/5', 'w-3/5'] },
	{ question: 'w-1/3', reply: ['w-full', 'w-10/12', 'w-2/3', 'w-1/2'] },
	{ question: 'w-1/2', reply: ['w-5/6', 'w-3/4'] },
];

const bar = 'animate-pulse rounded-md bg-muted motion-reduce:animate-none';

// the shape of a chat while it loads, so the page does not jump when it arrives
export function ChatSkeleton({
	count = turns.length,
	className,
}: {
	count?: number;
	className?: string;
}) {
	return (
		<div aria-hidden className={cn('flex flex-col gap-7', className)}>
			{turns.slice(0, count).map((turn, index) => (
				<div key={index} className="flex flex-col gap-7">
					<div
						className={cn(
							'ml-auto h-10 rounded-2xl rounded-br-md',
							bar,
							turn.question
						)}
					/>
					<div className="flex gap-3">
						<div className={cn('size-6 shrink-0 rounded-full', bar)} />
						<div className="flex flex-1 flex-col gap-2.5 pt-1">
							{turn.reply.map((width, line) => (
								<div key={line} className={cn('h-3.5', bar, width)} />
							))}
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
