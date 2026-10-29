import type { TutorAction } from '@orbi/shared';
import { ChevronRight } from 'lucide-react';
import { composerActions } from '@/features/home/actions';

type StudyToolButtonProps = {
	action: TutorAction;
	onClick: () => void;
};

// opens the tool in the tutor composer, on the chosen topic
export function StudyToolButton({ action, onClick }: StudyToolButtonProps) {
	const { label, description, icon: Icon, beta } = composerActions[action];

	return (
		<button
			type="button"
			onClick={onClick}
			className="group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
		>
			<span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground group-hover:bg-card group-hover:text-foreground">
				<Icon className="size-4" />
			</span>
			<span className="flex min-w-0 flex-1 flex-col">
				<span className="flex items-center gap-1.5 text-sm font-medium">
					{label}
					{beta && (
						<span className="rounded bg-muted px-1 text-[10px] font-medium text-muted-foreground uppercase">
							Beta
						</span>
					)}
				</span>
				<span className="truncate text-xs text-muted-foreground">
					{description}
				</span>
			</span>
			<ChevronRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
		</button>
	);
}
