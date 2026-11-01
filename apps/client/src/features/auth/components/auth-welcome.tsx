'use client';

import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
	useEffect,
	useEffectEvent,
	useRef,
	type CSSProperties,
	type ReactNode,
} from 'react';
import { Button } from '@/components/ui/button';
import { SuccessBurst } from '@/features/onboarding/components/success-burst';
import { routes } from '@/lib/routes';
import { transitionTypes } from '@/lib/transitions';
import { useSession } from '../hooks';
import { useArrival, type Arrival } from './guest-only';

const screens: Record<
	Arrival,
	{
		title: string;
		text: string;
		button: string;
		// a new account answers the onboarding questions first
		to: string;
		// returning students should not wait long; a new account gets a moment more
		ms: number;
	}
> = {
	login: {
		title: 'Welcome back',
		text: 'Opening your study space…',
		button: 'Open Orbi now',
		to: routes.app,
		ms: 2400,
	},
	signup: {
		// onboarding opens with "Welcome to Orbi", so this says something else
		title: 'Your account is ready',
		text: 'A few quick questions next, so Orbi fits the way you study.',
		button: 'Start now',
		to: routes.welcome,
		ms: 3200,
	},
};

const order = (place: number) => ({ '--stagger': place }) as CSSProperties;

// the form, or the welcome screen once the user has logged in or signed up
export function AuthFormSlot({ children }: { children: ReactNode }) {
	const arrival = useArrival();
	return arrival ? <AuthWelcome arrival={arrival} /> : children;
}

// the onboarding celebration, then the app opens by itself when the bar is full
function AuthWelcome({ arrival }: { arrival: Arrival }) {
	const screen = screens[arrival];
	const router = useRouter();
	const { data: session } = useSession();
	const firstName = session?.user.name.trim().split(/\s+/)[0];
	const headingRef = useRef<HTMLHeadingElement>(null);
	const go = () =>
		router.replace(screen.to, { transitionTypes: [transitionTypes.enterApp] });
	const open = useEffectEvent(go);

	useEffect(() => {
		headingRef.current?.focus({ preventScroll: true });
		const timer = window.setTimeout(open, screen.ms);
		return () => window.clearTimeout(timer);
	}, [screen.ms]);

	return (
		<div className="flex flex-col items-center gap-7 text-center">
			<SuccessBurst />
			<div className="flex flex-col gap-3">
				<h1
					ref={headingRef}
					tabIndex={-1}
					style={order(6)}
					className="stagger-in text-3xl font-semibold tracking-tight text-balance outline-none"
				>
					{screen.title}
					{firstName ? `, ${firstName}` : ''}
				</h1>
				<p
					style={order(7)}
					className="stagger-in text-pretty text-muted-foreground"
				>
					{screen.text}
				</p>
			</div>
			<div
				style={order(8)}
				className="stagger-in flex w-full max-w-xs flex-col items-center gap-3"
			>
				<div className="h-1 w-full overflow-hidden rounded-full bg-foreground/10">
					<div
						style={{ '--duration': `${screen.ms}ms` } as CSSProperties}
						className="countdown h-full w-full rounded-full bg-primary"
					/>
				</div>
				<Button
					type="button"
					variant="ghost"
					onClick={go}
					className="rounded-full"
				>
					{screen.button}
					<ArrowRight />
				</Button>
			</div>
		</div>
	);
}
