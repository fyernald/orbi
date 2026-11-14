'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToday } from '@/features/today/hooks';
import { planTotal } from '@/features/today/today';
import { routes, todayListRoute } from '@/lib/routes';

// a shortcut to today's study list from every other page; gone when nothing is
// left, and on Home, where the list itself is
export function ReviewButton() {
	const today = useToday();
	const onHome = usePathname() === routes.app;
	const count = today.data ? planTotal(today.data) : 0;
	if (count === 0 || onHome) return null;

	return (
		<Button asChild className="h-9 rounded-full px-4">
			<Link href={todayListRoute}>
				<span className="tabular-nums">{count} today</span>
				<span aria-hidden="true" className="hidden sm:inline">
					·
				</span>
				<span className="hidden sm:inline">Study</span>
			</Link>
		</Button>
	);
}
