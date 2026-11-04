import type { TutorAction } from '@orbi/shared';
import { SoonBadge } from '@/components/soon-badge';
import { composerActions } from '@/features/tutor/actions';
import { cn } from '@/lib/utils';

type StudyToolButtonProps = {
	action: TutorAction;
	onClick: () => void;
};

// a tile that opens the tool in the tutor composer, on the chosen topic; a tool
// that is not built yet is shown, but cannot be opened
export function StudyToolButton({ action, onClick }: StudyToolButtonProps) {
	const { label, description, icon: Icon, soon } = composerActions[action];

	return (
		<button
			type="button"
			onClick={onClick}
			disabled={soon}
			className={cn(
				'group flex h-full w-full flex-col items-start gap-2.5 rounded-2xl border border-border bg-card p-3.5 text-left transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
				soon
					? 'cursor-not-allowed opacity-60'
					: 'hover:border-foreground/20 hover:bg-muted/40'
			)}
		>
			<Icon
				className={cn(
					'size-5 text-muted-foreground transition-colors',
					!soon && 'group-hover:text-foreground'
				)}
			/>
			<span className="flex min-w-0 flex-col gap-0.5">
				<span className="flex flex-wrap items-center gap-1.5 text-sm font-semibold">
					{label}
					{soon && <SoonBadge />}
				</span>
				<span className="line-clamp-2 text-xs text-muted-foreground">
					{description}
				</span>
			</span>
		</button>
	);
}
