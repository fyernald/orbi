'use client';

import { OrbiMark } from '@/components/brand/orbi-mark';
import { useSession } from '@/features/auth/hooks';

const greetingFor = (hour: number) =>
	hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

export function HomeGreeting({ headline }: { headline: string }) {
	const { data: session } = useSession();
	const firstName = session?.user.name.split(' ')[0] ?? '';

	return (
		<div className="flex flex-col items-center gap-5 text-center">
			<OrbiMark className="size-12" />
			<div className="flex flex-col gap-2">
				<p className="text-base text-muted-foreground" suppressHydrationWarning>
					{greetingFor(new Date().getHours())}, {firstName}
				</p>
				<h1 className="text-2xl font-medium tracking-tight text-balance sm:text-[32px] sm:leading-tight">
					{headline}
				</h1>
			</div>
		</div>
	);
}
