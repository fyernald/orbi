import type { ReactNode } from 'react';

export function CourseDetail({
	label,
	children,
}: {
	label: string;
	children: ReactNode;
}) {
	return (
		<div className="flex items-center justify-between gap-3">
			<dt className="text-muted-foreground">{label}</dt>
			<dd className="tabular-nums">{children}</dd>
		</div>
	);
}
