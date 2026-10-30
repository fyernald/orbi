'use client';

import type { Course } from '@orbi/shared';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CourseBadge } from '@/features/courses/components/course-badge';
import { courseRoute, routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { useScrollEdges } from '../hooks';
import { SidebarLink } from './sidebar-link';
import { SidebarSectionTitle } from './sidebar-section-title';

// fades the edge with more courses beyond it, a hint that the list scrolls
const fades = {
	none: '',
	above:
		'[mask-image:linear-gradient(to_top,black_calc(100%-1.5rem),transparent)]',
	below:
		'[mask-image:linear-gradient(to_bottom,black_calc(100%-1.5rem),transparent)]',
	both: '[mask-image:linear-gradient(to_bottom,transparent,black_1.5rem,black_calc(100%-1.5rem),transparent)]',
};

type CoursesSectionProps = {
	// undefined while the courses are loading
	courses: Course[] | undefined;
	collapsed: boolean;
};

// takes the space left in the sidebar; the heading stays and the list scrolls,
// keeping room for about two courses before the sidebar itself has to scroll
export function CoursesSection({ courses, collapsed }: CoursesSectionProps) {
	const pathname = usePathname();
	const list = useScrollEdges();
	const fade =
		list.above && list.below
			? fades.both
			: list.above
				? fades.above
				: list.below
					? fades.below
					: fades.none;

	return (
		<section
			aria-labelledby="sidebar-courses"
			className="flex min-h-32 flex-1 flex-col gap-0.5"
		>
			<div
				aria-hidden="true"
				className="mx-2.5 mb-3 h-px shrink-0 bg-sidebar-border"
			/>
			<SidebarSectionTitle
				id="sidebar-courses"
				collapsed={collapsed}
				className="shrink-0 pr-1 text-muted-foreground"
				action={
					<Link
						href={routes.newCourse}
						aria-label="New course"
						className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
					>
						<Plus className="size-4" />
					</Link>
				}
			>
				My courses
			</SidebarSectionTitle>
			{courses?.length === 0 && !collapsed && (
				<p className="px-2.5 py-1 text-[13px] text-muted-foreground">
					No courses yet
				</p>
			)}
			{courses && courses.length > 0 && (
				<ul
					ref={list.ref}
					className={cn(
						'-mx-1 flex min-h-0 flex-1 flex-col gap-0.5 overflow-x-hidden overflow-y-auto px-1 py-0.5',
						collapsed && 'scrollbar-none',
						fade
					)}
				>
					{courses.map((course) => {
						const href = courseRoute(course.id);
						return (
							<li key={course.id}>
								<SidebarLink
									href={href}
									label={course.name}
									icon={<CourseBadge course={course} />}
									active={pathname === href}
									collapsed={collapsed}
								/>
							</li>
						);
					})}
				</ul>
			)}
		</section>
	);
}
