'use client';

import { useEffect } from 'react';
import { pageTitle } from '@/lib/page-title';

// Keeps the tab title in step with a name that changes on the page (a rename), after
// Next.js set it from the page's metadata. Nothing happens while the name is not known
// yet, so the metadata title stays; nothing is put back on unmount, because the next
// page has already set its own title by then.
export function usePageTitle(name: string | undefined) {
	useEffect(() => {
		if (name !== undefined) document.title = pageTitle(name);
	}, [name]);
}
