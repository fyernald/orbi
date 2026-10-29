import type { Course } from '@orbi/shared';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { courseTints } from '../tints';
import { CourseActions } from './course-actions';
import { CourseBadge } from './course-badge';

export function CourseHero({ course }: { course: Course }) {
	const tint = courseTints[course.color];

	return (
		<section
			className={cn(
				'relative overflow-hidden rounded-3xl border border-border bg-linear-to-br to-card to-70% p-6 sm:p-8',
				tint.hero
			)}
		>
			<span
				aria-hidden="true"
				className={cn(
					'pointer-events-none absolute -top-20 -right-16 size-64 rounded-full border-[36px]',
					tint.ring
				)}
			/>
			<nav
				aria-label="Breadcrumb"
				className="relative flex items-center gap-1.5 text-sm text-muted-foreground"
			>
				<Link
					href={routes.courses}
					className="transition-colors hover:text-foreground"
				>
					Courses
				</Link>
				<ChevronRight aria-hidden="true" className="size-3.5" />
				<span aria-current="page" className="truncate text-foreground">
					{course.name}
				</span>
			</nav>
			<div className="relative mt-5 flex items-start gap-4">
				<CourseBadge
					course={course}
					className="size-14 shrink-0 rounded-2xl text-base shadow-xs"
				/>
				<div className="flex min-w-0 flex-1 flex-col gap-1.5">
					<h1 className="text-2xl font-semibold tracking-tight break-words sm:text-3xl">
						{course.name}
					</h1>
					{course.description && (
						<p className="max-w-2xl text-muted-foreground">
							{course.description}
						</p>
					)}
				</div>
				<CourseActions course={course} />
			</div>
		</section>
	);
}
