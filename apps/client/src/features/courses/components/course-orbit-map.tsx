import type { Course } from '@orbi/shared';
import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import { orbitMoons, ringRadii } from '../orbit-map';
import { CourseMoon } from './course-moon';

// how far the orbit tips back, as if seen from a little above
const TILT = '62deg';
// seconds per turn for each ring; inner rings move faster, like real orbits
const ringSeconds = [60, 90, 120];

type CourseOrbitMapProps = {
	courses: Course[];
	now: Date;
};

// today in the middle, each course a moon: the sooner its exam, the closer it orbits;
// courses without an exam drift on the dashed outer ring. The rings turn slowly,
// stop while the pointer or focus is on the map, and stay still with reduced motion.
export function CourseOrbitMap({ courses, now }: CourseOrbitMapProps) {
	const moons = orbitMoons(courses, now);

	return (
		<div
			style={{ '--orbit-tilt': TILT } as CSSProperties}
			className="group/orbit relative aspect-[5/3] w-full perspective-[56rem]"
		>
			<div className="absolute top-1/2 left-0 aspect-square w-full -translate-y-1/2 transform-3d [transform:rotateX(var(--orbit-tilt))]">
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
					className="absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-6 ring-primary/15 [transform:rotateX(calc(var(--orbit-tilt)*-1))]"
				/>
				{ringSeconds.map((seconds, ring) => (
					<div
						key={ring}
						style={{ '--orbit-duration': `${seconds}s` } as CSSProperties}
						className="absolute inset-0 transform-3d animate-[orbit_var(--orbit-duration)_linear_infinite] group-focus-within/orbit:[animation-play-state:paused] group-hover/orbit:[animation-play-state:paused] motion-reduce:animate-none"
					>
						{moons
							.filter((moon) => moon.ring === ring)
							.map(({ course, x, y }) => (
								<CourseMoon
									key={course.id}
									course={course}
									now={now}
									x={x}
									y={y}
								/>
							))}
					</div>
				))}
			</div>
		</div>
	);
}
