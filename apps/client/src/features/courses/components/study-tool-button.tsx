import type { TutorAction } from '@orbi/shared';
import { composerActions } from '@/features/tutor/actions';
import { BetaBadge } from '@/features/tutor/components/beta-badge';

type StudyToolButtonProps = {
	action: TutorAction;
	onClick: () => void;
};

// a tile that opens the tool in the tutor composer, on the chosen topic
export function StudyToolButton({ action, onClick }: StudyToolButtonProps) {
	const { label, description, icon: Icon, beta } = composerActions[action];

	return (
		<button
			type="button"
			onClick={onClick}
			className="group flex h-full w-full flex-col items-start gap-2.5 rounded-2xl border border-border bg-card p-3.5 text-left transition-colors hover:border-foreground/20 hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
		>
			<Icon className="size-5 text-muted-foreground transition-colors group-hover:text-foreground" />
			<span className="flex min-w-0 flex-col gap-0.5">
				<span className="flex flex-wrap items-center gap-1.5 text-sm font-semibold">
					{label}
					{beta && <BetaBadge />}
				</span>
				<span className="line-clamp-2 text-xs text-muted-foreground">
					{description}
				</span>
			</span>
		</button>
	);
}
