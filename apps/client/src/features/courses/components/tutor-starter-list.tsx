import { ArrowUpRight } from 'lucide-react';
import { composerActions } from '@/features/tutor/actions';
import type { TutorStarter } from '../tutor-starters';

type TutorStarterListProps = {
	starters: TutorStarter[];
	onStart: (starter: Omit<TutorStarter, 'label'>) => void;
};

export function TutorStarterList({ starters, onStart }: TutorStarterListProps) {
	if (starters.length === 0) {
		return (
			<p className="rounded-xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
				Add your first topic in the Topics pane. Orbi then suggests where to
				start.
			</p>
		);
	}

	return (
		<section aria-labelledby="starters-title" className="flex flex-col gap-3">
			<h3 id="starters-title" className="text-lg font-semibold tracking-tight">
				Where do you want to start?
			</h3>
			<ul className="grid gap-2 sm:grid-cols-2">
				{starters.map(({ label, ...starter }) => {
					const Icon = composerActions[starter.action].icon;
					return (
						<li key={label}>
							<button
								type="button"
								onClick={() => onStart(starter)}
								className="group flex h-full w-full items-center gap-3 rounded-xl border border-border px-3.5 py-3 text-left text-sm transition-colors hover:border-foreground/20 hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
							>
								<Icon className="size-4 shrink-0 text-muted-foreground" />
								<span className="min-w-0 flex-1">{label}</span>
								<ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
							</button>
						</li>
					);
				})}
			</ul>
		</section>
	);
}
