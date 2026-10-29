'use client';

import { usePathname } from 'next/navigation';
import { pageTitleFor } from '../page-titles';

export function PageTitle({ className }: { className?: string }) {
	const title = pageTitleFor(usePathname());
	if (!title) return null;

	return <p className={className}>{title}</p>;
}
