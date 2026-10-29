import { Plus } from 'lucide-react';
import Link from 'next/link';
import { routes } from '@/lib/routes';

export function NewCourseTile() {
	return (
		<Link
			href={routes.newCourse}
			className="flex h-full min-h-56 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
		>
			<span className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
				<Plus className="size-5" />
			</span>
			<span className="flex flex-col gap-0.5">
				<span className="font-medium">New course</span>
				<span className="text-sm text-muted-foreground">
					Name it, set the goal, add topics
				</span>
			</span>
		</Link>
	);
}
