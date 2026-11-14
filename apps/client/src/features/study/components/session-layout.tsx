import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type SessionLayoutProps = {
	start?: ReactNode;
	end?: ReactNode;
	children: ReactNode;
	// the sides show above the centre on narrow pages too, instead of being left to
	// the phone header
	stackSides?: boolean;
};

// Three parts once the page is wide enough (measured on the page, so the app's sidebar
// counts): the course on the left, the question in the centre, the map on the right.
// One column below that.
export function SessionLayout({
	start,
	end,
	children,
	stackSides = false,
}: SessionLayoutProps) {
	const side = cn(
		'min-w-0 flex-col gap-6 @5xl:sticky @5xl:top-8 @5xl:flex',
		stackSides ? 'flex' : 'hidden'
	);

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-8 @5xl:grid @5xl:max-w-none @5xl:grid-cols-[minmax(12rem,15rem)_minmax(0,44rem)_minmax(12rem,15rem)] @5xl:items-start @5xl:justify-center @5xl:gap-10">
			<div className={side}>{start}</div>
			<div
				className={cn(
					'flex min-w-0 flex-col gap-8',
					stackSides && 'order-last @5xl:order-none'
				)}
			>
				{children}
			</div>
			<div className={side}>{end}</div>
		</div>
	);
}
