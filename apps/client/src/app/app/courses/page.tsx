import { Plus } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CoursesSummary } from '@/features/courses/components/courses-summary';
import { CoursesView } from '@/features/courses/components/courses-view';
import { routes } from '@/lib/routes';

export const metadata: Metadata = { title: 'Courses' };

export default function CoursesPage() {
	return (
		<section className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 md:px-7">
			<header className="flex flex-wrap items-end justify-between gap-3">
				<div className="flex min-w-0 flex-col gap-1">
					<h1 className="text-2xl font-semibold tracking-tight">Courses</h1>
					<CoursesSummary />
				</div>
				<Button asChild variant="outline" className="h-9 rounded-lg px-3.5">
					<Link href={routes.newCourse}>
						<Plus />
						New course
					</Link>
				</Button>
			</header>
			<CoursesView />
		</section>
	);
}
