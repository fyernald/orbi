import type { Course } from '@orbi/shared';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { courseRoute } from '@/lib/routes';
import { upNextStep } from '../up-next';

type UpNextRowProps = {
	course: Course;
	now: Date;
};

// the one thing to do next, with one button
export function UpNextRow({ course, now }: UpNextRowProps) {
	const step = upNextStep(course, now);

	return (
		<section
			aria-labelledby="up-next-title"
			className="flex flex-wrap items-center gap-4 rounded-2xl bg-accent px-5 py-4"
		>
			<span
				aria-hidden="true"
				className="relative size-9 shrink-0 rounded-full border-[1.5px] border-accent-foreground"
			>
				<span className="absolute top-0.5 right-0 size-2 rounded-full bg-accent-foreground" />
			</span>
			<div className="flex min-w-0 flex-1 basis-64 flex-col gap-0.5">
				<h2 id="up-next-title" className="font-semibold">
					{step.title}
				</h2>
				<p className="text-sm text-accent-foreground">{step.detail}</p>
			</div>
			<Button asChild className="h-10 rounded-xl px-4">
				<Link href={courseRoute(course.id)}>{step.action}</Link>
			</Button>
		</section>
	);
}
