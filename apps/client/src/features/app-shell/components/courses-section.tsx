import { Plus } from 'lucide-react';
import Link from 'next/link';
import { routes } from '@/lib/routes';
import type { CourseSummary } from '../mock-data';
import { CourseBadge } from './course-badge';
import { SidebarLink } from './sidebar-link';
import { SidebarSectionTitle } from './sidebar-section-title';

type CoursesSectionProps = {
	courses: CourseSummary[];
	collapsed: boolean;
};

export function CoursesSection({ courses, collapsed }: CoursesSectionProps) {
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
						href={routes.courses}
						aria-label="Add course"
						className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
					>
						<Plus className="size-4" />
					</Link>
				}
			>
				My courses
			</SidebarSectionTitle>
			{courses.map((course) => (
				<SidebarLink
					key={course.id}
					href={routes.courses}
					label={course.name}
					icon={<CourseBadge course={course} />}
					trailing={
						<span
							aria-label={`${course.mastery}% mastery`}
							className="text-[13px] text-muted-foreground tabular-nums"
						>
							{course.mastery}%
						</span>
					}
					collapsed={collapsed}
				/>
			))}
		</section>
	);
}
