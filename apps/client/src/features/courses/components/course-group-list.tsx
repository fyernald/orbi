import type { CourseGroup } from '../course-groups';
import { CourseRow } from './course-row';

type CourseGroupListProps = {
	groups: CourseGroup[];
	now: Date;
};

export function CourseGroupList({ groups, now }: CourseGroupListProps) {
	return (
		<div className="flex flex-col gap-7">
			{groups.map((group) => (
				<section
					key={group.id}
					aria-labelledby={`course-group-${group.id}`}
					className="flex flex-col gap-1"
				>
					<h2
						id={`course-group-${group.id}`}
						className="px-3 text-[13px] font-medium text-muted-foreground"
					>
						{group.title}
					</h2>
					<ul className="flex flex-col">
						{group.courses.map((course) => (
							<li key={course.id}>
								<CourseRow course={course} now={now} />
							</li>
						))}
					</ul>
				</section>
			))}
		</div>
	);
}
