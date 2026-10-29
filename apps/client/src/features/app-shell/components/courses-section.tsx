'use client';

import type { Course } from '@orbi/shared';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CourseBadge } from '@/features/courses/components/course-badge';
import { courseRoute, routes } from '@/lib/routes';
import { SidebarLink } from './sidebar-link';
import { SidebarSectionTitle } from './sidebar-section-title';

type CoursesSectionProps = {
	// undefined while the courses are loading
	courses: Course[] | undefined;
	collapsed: boolean;
};

export function CoursesSection({ courses, collapsed }: CoursesSectionProps) {
	const pathname = usePathname();

	return (
		<section
			aria-labelledby="sidebar-courses"
			className="flex flex-col gap-0.5"
		>
			<div aria-hidden="true" className="mx-2.5 mb-3 h-px bg-sidebar-border" />
			<SidebarSectionTitle
				id="sidebar-courses"
				collapsed={collapsed}
				className="pr-1 text-muted-foreground"
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
			{courses?.map((course) => {
				const href = courseRoute(course.id);
				return (
					<SidebarLink
						key={course.id}
						href={href}
						label={course.name}
						icon={<CourseBadge course={course} />}
						active={pathname === href}
						collapsed={collapsed}
					/>
				);
			})}
		</section>
	);
}
