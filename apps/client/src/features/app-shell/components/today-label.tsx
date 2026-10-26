'use client';

import { useBrowserValue } from '@/hooks/use-browser-value';

const format = new Intl.DateTimeFormat('en-GB', {
	weekday: 'long',
	day: 'numeric',
	month: 'long',
});

export function TodayLabel({ className }: { className?: string }) {
	const today = useBrowserValue(() => format.format(new Date()));
	return <span className={className}>{today}</span>;
}
