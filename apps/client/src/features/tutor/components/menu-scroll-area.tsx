import type { ReactNode } from 'react';

// every item inside needs this height, so three fit and a bit of the fourth
// peeks out, which shows the list scrolls
export const menuItemHeight = 'h-13';

export function MenuScrollArea({ children }: { children: ReactNode }) {
	return (
		<div className="max-h-[11.375rem] overflow-y-auto overscroll-contain">
			{children}
		</div>
	);
}
