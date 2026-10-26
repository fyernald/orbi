'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

// for values from the browser's clock: the server can be in another time zone,
// so the server renders null and the browser fills the value in after hydration
// (suppressHydrationWarning would keep the server's text instead)
export function useBrowserValue<T>(read: () => T): T | null {
	return useSyncExternalStore(subscribe, read, () => null);
}
