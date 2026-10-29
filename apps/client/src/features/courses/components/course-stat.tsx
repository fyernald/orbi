import type { ReactNode } from 'react';

type CourseStatProps = {
	icon: ReactNode;
	label: string;
	hint?: string;
	children: ReactNode;
};

export function CourseStat({ icon, label, hint, children }: CourseStatProps) {
	return (
		<div className="flex flex-col gap-1.5 bg-card px-5 py-4">
			<dt className="flex items-center gap-1.5 text-sm text-muted-foreground [&_svg]:size-4">
				{icon}
				{label}
			</dt>
			<dd className="flex flex-col">
				<span className="truncate font-medium tabular-nums">{children}</span>
				{hint && <span className="text-xs text-muted-foreground">{hint}</span>}
			</dd>
		</div>
	);
}
