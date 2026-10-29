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

// wide screens show all panes side by side, so this is for phones and tablets
export function MobilePaneTabs({ value, onChange }: MobilePaneTabsProps) {
	return (
		<div
			role="tablist"
			aria-label="Course panes"
			className="flex gap-0.5 border-b border-divider px-4 lg:hidden"
		>
			{panes.map((pane) => (
				<button
					key={pane.value}
					type="button"
					role="tab"
					aria-selected={value === pane.value}
					onClick={() => onChange(pane.value)}
					className={cn(
						'-mb-px h-11 border-b-2 px-3 text-sm transition-colors',
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
