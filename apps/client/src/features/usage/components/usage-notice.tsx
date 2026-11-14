import { Gauge, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UsageNotice as Notice } from '../usage';

type Level = Notice['level'] | 'blocked';

const levelStyles: Record<Level, string> = {
	warning: 'border-border bg-card text-muted-foreground',
	almost:
		'border-tone-amber-foreground/30 bg-tone-amber text-tone-amber-foreground',
	grace: 'border-tone-red-foreground/30 bg-tone-red text-tone-red-foreground',
	blocked: 'border-tone-red-foreground/30 bg-tone-red text-tone-red-foreground',
};

type UsageNoticeProps = {
	level: Level;
	text: string;
	// a block cannot be hidden, it says why nothing can be sent
	onDismiss?: () => void;
};

// a quiet line above the message box when a limit is near; it never covers the chat
export function UsageNotice({ level, text, onDismiss }: UsageNoticeProps) {
	return (
		<div
			role="status"
			className={cn(
				'mx-2 flex items-center gap-2.5 rounded-2xl border px-3.5 py-2 text-[13px]',
				levelStyles[level]
			)}
		>
			<Gauge aria-hidden="true" className="size-4 shrink-0" />
			<p className="min-w-0 flex-1 text-pretty">{text}</p>
			{onDismiss && (
				<button
					type="button"
					aria-label="Hide this notice"
					onClick={onDismiss}
					className="-mr-1 grid size-7 shrink-0 place-items-center rounded-full opacity-70 transition-opacity outline-none hover:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/50"
				>
					<X className="size-3.5" />
				</button>
			)}
		</div>
	);
}
