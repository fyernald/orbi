import { Plus } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CoursesView } from '@/features/courses/components/courses-view';
import { routes } from '@/lib/routes';

export const metadata: Metadata = { title: 'Courses' };

export default function CoursesPage() {
	return (
		<section className="flex w-full flex-col gap-5 px-4 py-6 md:px-7">
			<header className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex flex-col gap-0.5">
					<h1 className="text-xl font-semibold tracking-tight">Courses</h1>
					<p className="text-sm text-muted-foreground">
						Each course holds the topics, notes, and questions of one class.
					</p>
				</div>
				<Button asChild className="h-9 rounded-lg px-3.5">
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
