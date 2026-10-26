'use client';

import { OrbiMark } from '@/components/brand/orbi-mark';
import { useSession } from '@/features/auth/hooks';
import { useBrowserValue } from '@/hooks/use-browser-value';

const greetingFor = (hour: number) =>
	hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

export function HomeGreeting() {
	const { data: session } = useSession();
	const hour = useBrowserValue(() => new Date().getHours());
	const firstName = session?.user.name.trim().split(' ')[0];
	const greeting = hour === null ? '' : greetingFor(hour);

	return (
		<div className="flex flex-col items-center gap-5 text-center">
			<OrbiMark className="size-12" />
			<div className="flex flex-col gap-2">
				{/* keeps its height while the greeting waits for the browser's clock */}
				<p className="min-h-6 text-base text-muted-foreground">
					{greeting && (firstName ? `${greeting}, ${firstName}` : greeting)}
				</p>
				<h1 className="text-2xl font-medium tracking-tight text-balance sm:text-[32px] sm:leading-tight">
					What are you studying today?
				</h1>
			</div>
		</div>
	);
}
