'use client';

import { ArrowRight } from 'lucide-react';
import { useEffect, useEffectEvent, useRef, type CSSProperties } from 'react';
import { Button } from '@/components/ui/button';
import { SuccessBurst } from './success-burst';

// long enough to enjoy the moment, short enough not to wait for it
const ALL_SET_MS = 3600;

type AllSetStepProps = {
	// the name the student asked Orbi to use
	greeting: string;
	summary: string[];
	onDone: () => void;
};

const order = (place: number) => ({ '--stagger': place }) as CSSProperties;

// the moment onboarding is finished; it opens the app by itself when the bar is full
export function AllSetStep({ greeting, summary, onDone }: AllSetStepProps) {
	const headingRef = useRef<HTMLHeadingElement>(null);
	const done = useEffectEvent(onDone);

	useEffect(() => {
		headingRef.current?.focus({ preventScroll: true });
		const timer = window.setTimeout(done, ALL_SET_MS);
		return () => window.clearTimeout(timer);
	}, []);

	return (
		<div className="flex flex-col items-center gap-7 text-center">
			<SuccessBurst />
			<div className="flex flex-col gap-3">
				<h1
					ref={headingRef}
					tabIndex={-1}
					style={order(6)}
					className="stagger-in text-3xl font-semibold tracking-tight text-balance outline-none sm:text-4xl"
				>
					You’re all set{greeting ? `, ${greeting}` : ''}
				</h1>
				<p
					style={order(7)}
					className="stagger-in text-base text-pretty text-muted-foreground"
				>
					Orbi is getting your study space ready.
				</p>
			</div>
			<ul className="flex flex-wrap justify-center gap-2">
				{summary.map((item, index) => (
					<li
						key={item}
						style={order(8 + index)}
						className="stagger-in flex h-8 items-center rounded-full border border-border bg-card/70 px-3 text-sm text-subtle-foreground backdrop-blur-sm"
					>
						{item}
					</li>
				))}
			</ul>
			<div
				style={order(11)}
				className="stagger-in flex w-full max-w-xs flex-col items-center gap-3"
			>
				<div className="h-1 w-full overflow-hidden rounded-full bg-foreground/10">
					<div
						style={{ '--duration': `${ALL_SET_MS}ms` } as CSSProperties}
						className="countdown h-full w-full rounded-full bg-primary"
					/>
				</div>
				<Button
					type="button"
					variant="ghost"
					onClick={onDone}
					className="rounded-full"
				>
					Open Orbi now
					<ArrowRight />
				</Button>
			</div>
		</div>
	);
}
