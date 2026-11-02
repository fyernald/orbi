import { CornerDownRight } from 'lucide-react';

type FollowUpPillProps = {
	question: string;
	disabled: boolean;
	// the pills come in one after another
	delayMs: number;
	onAsk: (question: string) => void;
};

export function FollowUpPill({
	question,
	disabled,
	delayMs,
	onAsk,
}: FollowUpPillProps) {
	return (
		<button
			type="button"
			disabled={disabled}
			onClick={() => onAsk(question)}
			style={{ animationDelay: `${delayMs}ms` }}
			className="flex max-w-full items-start gap-2 rounded-2xl border border-border bg-card px-3.5 py-1.5 text-left text-sm text-foreground transition-colors duration-150 animate-in fade-in-0 fill-mode-both slide-in-from-bottom-1 hover:border-primary/40 hover:bg-accent hover:text-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
		>
			<CornerDownRight className="mt-0.5 size-3.5 shrink-0 text-primary" />
			<span className="min-w-0 break-words">{question}</span>
		</button>
	);
}
