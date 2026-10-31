'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const SLOW_AFTER_MS = 8000;

// a shimmering line that says what Orbi is doing; it says so when it takes long
export function Thinking({
	label,
	className,
}: {
	label: string;
	className?: string;
}) {
	const [slow, setSlow] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
		return () => clearTimeout(timer);
	}, []);

	return (
		<p className={cn('shimmer-text text-sm font-medium', className)}>
			{slow ? 'Still working. Long notes take a little longer.' : label}
		</p>
	);
}
