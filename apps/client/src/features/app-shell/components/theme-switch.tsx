'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { useBrowserValue } from '@/hooks/use-browser-value';

type Roll = 'to-dark' | 'to-light';

// a pill whose knob rolls to the other side. Where the knob rests follows the page's
// dark class, so it is right from the first paint; the roll is a keyframe animation,
// because next-themes turns transitions off while the theme changes
export function ThemeSwitch() {
	const { resolvedTheme, setTheme } = useTheme();
	const [roll, setRoll] = useState<Roll | null>(null);
	// next-themes knows the theme only once mounted
	const mounted = useBrowserValue(() => true);

	function toggle() {
		const dark = document.documentElement.classList.contains('dark');
		setRoll(dark ? 'to-light' : 'to-dark');
		setTheme(dark ? 'light' : 'dark');
	}

	return (
		<button
			type="button"
			role="switch"
			aria-checked={mounted ? resolvedTheme === 'dark' : false}
			aria-label="Dark mode"
			onClick={toggle}
			data-roll={roll ?? undefined}
			className="theme-switch relative inline-flex h-8 w-16 shrink-0 items-center rounded-full bg-sky-100 p-1 shadow-[inset_0_0_0_1px_var(--border)] outline-none focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-indigo-950"
		>
			<span aria-hidden className="theme-switch-stars">
				<span className="top-2 left-3 size-0.5" />
				<span className="top-4 left-5 size-1" />
				<span className="top-5.5 left-2.5 size-0.5" />
			</span>
			<span
				aria-hidden
				className="theme-switch-knob relative grid size-6 place-items-center rounded-full bg-background shadow-sm"
			>
				<Sun className="theme-switch-sun absolute size-4 text-amber-500" />
				<Moon className="theme-switch-moon absolute size-3.5 text-indigo-300" />
			</span>
		</button>
	);
}
