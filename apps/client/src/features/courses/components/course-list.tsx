import type { Course } from '@orbi/shared';
import { BookOpen, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { routes } from '@/lib/routes';
import { CourseCard } from './course-card';

export function CourseList({ courses }: { courses: Course[] }) {
	if (courses.length === 0) {
		return (
			<div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border px-6 py-12 text-center">
				<span className="flex size-12 items-center justify-center rounded-2xl bg-tone-blue text-tone-blue-foreground">
					<BookOpen className="size-6" />
				</span>
				<div className="flex flex-col gap-1">
					<p className="font-medium">No courses yet</p>
					<p className="max-w-sm text-sm text-muted-foreground">
						Add a course for each class you study for. Orbi keeps your topics,
						notes, and questions inside it.
					</p>
				</div>
				<Button asChild className="h-10 rounded-full px-5">
					<Link href={routes.newCourse}>
						<Plus />
						Create your first course
					</Link>
				</Button>
			</div>
		);
	}

	return (
		<ul className="grid gap-3 sm:grid-cols-2">
			{courses.map((course) => (
				<li key={course.id}>
					<CourseCard course={course} />
				</li>
			))}
		</ul>
	);
}
