'use client';

import { Globe2 } from 'lucide-react';
import { useBrowserValue } from '@/hooks/use-browser-value';
import { timeIn, timeZoneParts } from '../time-zones';

// the chosen zone, with the time it is there now so the student can check it at a glance
export function TimeZoneCard({ zone }: { zone: string }) {
	const { city, region } = timeZoneParts(zone);
	const time = useBrowserValue(() => timeIn(zone, new Date()));

	return (
		<div className="stagger-in flex items-center gap-4 rounded-2xl border border-primary bg-primary/8 p-5 shadow-[0_0_0_1px_var(--primary)]">
			<span
				aria-hidden="true"
				className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"
			>
				<Globe2 className="size-5" />
			</span>
			<div className="flex min-w-0 flex-col">
				<p className="truncate text-lg font-semibold">{city}</p>
				{region && (
					<p className="truncate text-sm text-muted-foreground">{region}</p>
				)}
			</div>
			{time && (
				<div className="ml-auto flex flex-col items-end">
					<p className="text-2xl font-semibold tabular-nums">{time}</p>
					<p className="text-xs text-muted-foreground">there now</p>
				</div>
			)}
		</div>
	);
}
