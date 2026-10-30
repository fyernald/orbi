import type { Course } from '@orbi/shared';
import { cn } from '@/lib/utils';
import { orbitMoons, ringRadii } from '../orbit-map';
import { CourseMoon } from './course-moon';

type CourseOrbitMapProps = {
	courses: Course[];
	now: Date;
};

// today in the middle, each course a moon: the sooner its exam, the closer it orbits;
// courses without an exam drift on the dashed outer ring
export function CourseOrbitMap({ courses, now }: CourseOrbitMapProps) {
	return (
		<div className="relative aspect-square w-full">
			{ringRadii.map((radius, ring) => (
				<span
					key={radius}
					aria-hidden="true"
					style={{ inset: `${50 - radius}%` }}
					className={cn(
						'absolute rounded-full border border-border',
						ring === 0 && 'bg-accent/50',
						ring === ringRadii.length - 1 && 'border-dashed'
					)}
				/>
			))}
			<span
				aria-hidden="true"
				className="absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-6 ring-primary/15"
			/>
			{orbitMoons(courses, now).map(({ course, x, y }) => (
				<CourseMoon key={course.id} course={course} now={now} x={x} y={y} />
			))}
		</div>
	);
}
