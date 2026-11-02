import { cn } from '@/lib/utils';

export type WorkspacePane = 'topics' | 'tutor' | 'study';

const panes: { value: WorkspacePane; label: string }[] = [
	{ value: 'topics', label: 'Topics' },
	{ value: 'tutor', label: 'Tutor' },
	{ value: 'study', label: 'Study' },
];

type MobilePaneTabsProps = {
	value: WorkspacePane;
	onChange: (pane: WorkspacePane) => void;
};

// Wide screens show all panes side by side, so this is for phones and tablets. The
// panes are not tab panels on wide screens, so these are plain buttons that say which
// pane shows (aria-pressed) instead of the tabs pattern.
export function MobilePaneTabs({ value, onChange }: MobilePaneTabsProps) {
	return (
		<div
			role="group"
			aria-label="Course panes"
			className="flex gap-0.5 border-b border-divider px-4 lg:hidden"
		>
			{panes.map((pane) => (
				<button
					key={pane.value}
					type="button"
					aria-pressed={value === pane.value}
					onClick={() => onChange(pane.value)}
					className={cn(
						'-mb-px h-11 border-b-2 px-3 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
						value === pane.value
							? 'border-primary font-medium text-foreground'
							: 'border-transparent text-muted-foreground hover:text-foreground'
					)}
				>
					{pane.label}
				</button>
			))}
		</div>
	);
}
