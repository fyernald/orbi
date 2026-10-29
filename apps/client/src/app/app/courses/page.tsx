import { Plus } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CoursesView } from '@/features/courses/components/courses-view';
import { routes } from '@/lib/routes';

export const metadata: Metadata = { title: 'Courses' };

export default function CoursesPage() {
	return (
		<section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-8">
			<header className="flex flex-wrap items-end justify-between gap-4">
				<div className="flex flex-col gap-1">
					<h1 className="text-2xl font-medium tracking-tight">Your courses</h1>
					<p className="text-sm text-muted-foreground">
						One course for each class, with its topics inside.
					</p>
				</div>
				<Button asChild className="h-10 rounded-full px-5">
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
