import type { TutorAction } from '@orbi/shared';
import Link from 'next/link';
import { composerActions } from '@/features/home/actions';
import { courseRoute } from '@/lib/routes';
import { cn } from '@/lib/utils';

type StudyShortcutsProps = {
	courseId: string;
	actions: TutorAction[];
	// icons only on a course card, icons with words on the up-next card
	compact?: boolean;
	className?: string;
};

// each opens the course's study space with that tool ready in the tutor
export function StudyShortcuts({
	courseId,
	actions,
	compact = false,
	className,
}: StudyShortcutsProps) {
	return (
		<ul className={cn('flex items-center gap-1', className)}>
			{actions.map((action) => {
				const { label, icon: Icon } = composerActions[action];
				return (
					<li key={action}>
						<Link
							href={courseRoute(courseId, { tool: action })}
							aria-label={compact ? label : undefined}
							title={compact ? label : undefined}
							className={cn(
								'flex items-center gap-1.5 rounded-lg text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
								compact
									? 'size-8 justify-center text-muted-foreground hover:bg-muted hover:text-foreground'
									: 'h-9 border border-border bg-card px-3 hover:bg-muted'
							)}
						>
							<Icon className="size-4" />
							{!compact && label}
						</Link>
					</li>
				);
			})}
		</ul>
	);
}
