import { BookOpen, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { routes } from '@/lib/routes';

export function CoursesEmpty() {
	return (
		<div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border px-6 py-16 text-center">
			<span className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
				<BookOpen className="size-5" />
			</span>
			<div className="flex flex-col gap-1">
				<p className="font-medium">No courses yet</p>
				<p className="max-w-sm text-sm text-muted-foreground">
					Add a course for each class you study for. Its topics, notes, and
					questions live inside it.
				</p>
			</div>
			<Button asChild className="h-9 rounded-lg px-4">
				<Link href={routes.newCourse}>
					<Plus />
					New course
				</Link>
			</Button>
		</div>
	);
}
