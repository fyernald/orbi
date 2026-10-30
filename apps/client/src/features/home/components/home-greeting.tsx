'use client';

import { OrbiMark } from '@/components/brand/orbi-mark';
import { useBrowserValue } from '@/hooks/use-browser-value';

const greetingFor = (hour: number) =>
	hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

// name is what the student asked Orbi to call them in onboarding
export function HomeGreeting({ name }: { name: string }) {
	const hour = useBrowserValue(() => new Date().getHours());
	const greeting = hour === null ? '' : greetingFor(hour);

	return (
		<div className="flex flex-col items-center gap-4 text-center">
			<OrbiMark className="size-10" />
			<div className="flex flex-col gap-2">
				{/* keeps its height while the greeting waits for the browser's clock */}
				<p className="min-h-6 text-base text-muted-foreground">
					{greeting && (name ? `${greeting}, ${name}` : greeting)}
				</p>
				<h1 className="text-2xl font-medium tracking-tight text-balance sm:text-[28px] sm:leading-tight">
					What are you studying today?
				</h1>
			</div>
		</div>
	);
}
