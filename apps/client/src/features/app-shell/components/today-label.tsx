'use client';

const format = new Intl.DateTimeFormat('en-GB', {
	weekday: 'long',
	day: 'numeric',
	month: 'long',
});

export function TodayLabel({ className }: { className?: string }) {
	// uses the browser's date, the server can be in another time zone
	return (
		<span className={className} suppressHydrationWarning>
			{format.format(new Date())}
		</span>
	);
}
