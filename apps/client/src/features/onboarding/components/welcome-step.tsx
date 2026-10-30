import { Clock, ListChecks } from 'lucide-react';
import { firstName } from '@/features/profile/first-name';
import { OrbitHero } from './orbit-hero';

type WelcomeStepProps = {
	name: string;
	questions: number;
};

export function WelcomeStep({ name, questions }: WelcomeStepProps) {
	const greeting = firstName(name);

	return (
		<div className="flex flex-col items-center gap-8 pt-4 text-center">
			<OrbitHero />
			<div className="flex flex-col gap-3">
				<h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
					Welcome to Orbi{greeting ? `, ${greeting}` : ''}
				</h1>
				<p className="mx-auto max-w-md text-base text-pretty text-muted-foreground">
					A few quick questions, and Orbi plans your studies around you: what to
					study, when, and how it is explained.
				</p>
			</div>
			<ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-subtle-foreground">
				<li className="flex items-center gap-2">
					<ListChecks aria-hidden="true" className="size-4 text-primary" />
					{questions} questions
				</li>
				<li className="flex items-center gap-2">
					<Clock aria-hidden="true" className="size-4 text-primary" />
					About a minute
				</li>
			</ul>
		</div>
	);
}
