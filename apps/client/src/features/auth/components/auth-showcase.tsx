'use client';

import { usePathname } from 'next/navigation';
import type { CSSProperties, ReactNode } from 'react';
import { StarField } from '@/features/onboarding/components/star-field';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { AuthOrbit } from './auth-orbit';
import { ExamPreview, QuizPreview, TutorPreview } from './showcase-cards';

type Caption = { title: string; text: string };

const captions: Record<string, Caption> = {
	[routes.login]: {
		title: 'Your orbit kept turning.',
		text: 'Your courses, notes, and tutor chats are where you left them.',
	},
	[routes.signup]: {
		title: 'Turn your notes into practice.',
		text: 'Add your courses and notes. Orbi explains them and writes questions that check what you know.',
	},
};

const passwordCaption: Caption = {
	title: 'Back in orbit soon.',
	text: 'Choose a new password and pick up where you left off.',
};

// enters with the page, then drifts slowly up and down
function Floating({
	order,
	className,
	children,
}: {
	order: number;
	className: string;
	children: ReactNode;
}) {
	return (
		<div
			style={{ '--float-delay': `${order * -2.3}s` } as CSSProperties}
			className={cn('float-card absolute', className)}
		>
			<div
				style={{ '--stagger': order + 2 } as CSSProperties}
				className="stagger-in"
			>
				{children}
			</div>
		</div>
	);
}

// The night sky next to the login and sign-up forms, always dark: Orbi with courses
// going round it, and small copies of real screens. It lives in the layout, so it
// stays put when the student moves between login and sign-up; only the caption changes.
export function AuthShowcase({ className }: { className?: string }) {
	const pathname = usePathname();
	const caption = captions[pathname] ?? passwordCaption;

	return (
		<div
			className={cn(
				'dark relative flex flex-col overflow-hidden rounded-[28px] border border-foreground/10 bg-background text-foreground',
				className
			)}
		>
			<div aria-hidden="true" className="absolute inset-0">
				<div className="auth-sky absolute inset-0" />
				<StarField travel={0} />
				<AuthOrbit className="absolute top-[42%] left-1/2 w-[min(50rem,118%)] -translate-x-1/2 -translate-y-1/2" />
				<Floating order={0} className="top-[6%] left-[6%]">
					<QuizPreview />
				</Floating>
				<Floating order={1} className="top-[62%] right-[6%]">
					<TutorPreview />
				</Floating>
				<Floating order={2} className="top-[14%] right-[7%]">
					<ExamPreview />
				</Floating>
			</div>
			<div
				key={pathname}
				className="relative mt-auto flex flex-col gap-3 p-10 xl:p-12"
			>
				<p
					style={{ '--stagger': 0 } as CSSProperties}
					className="stagger-in text-3xl font-semibold tracking-tight text-balance"
				>
					{caption.title}
				</p>
				<p
					style={{ '--stagger': 1 } as CSSProperties}
					className="stagger-in max-w-md text-pretty text-muted-foreground"
				>
					{caption.text}
				</p>
			</div>
		</div>
	);
}
