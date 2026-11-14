'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const SLOW_AFTER_MS = 8000;

type ThinkingProps = {
	label: string;
	// what it says instead once it takes long; without one the label stays
	slowLabel?: string;
	className?: string;
};

// a shimmering line that says what Orbi is doing
export function Thinking({ label, slowLabel, className }: ThinkingProps) {
	const [slow, setSlow] = useState(false);

	useEffect(() => {
		if (!slowLabel) return;
		const timer = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
		return () => clearTimeout(timer);
	}, [slowLabel]);

	return (
		<p className={cn('shimmer-text text-sm font-medium', className)}>
			{slow && slowLabel ? slowLabel : label}
		</p>
	);
}
