'use client';

import { XIcon } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import type { Tip } from '../tips';

type TipBubbleProps = {
	tip: Tip;
	onClose: () => void;
	// the bubble is gone after a close, so the focus goes back to the cat
	returnFocus: () => void;
};

// A speech bubble under the cat. It sits in the top bar's corner over the page,
// small enough not to hide what the student is doing, and it comes after the
// cat in the tab order.
export function TipBubble({ tip, onClose, returnFocus }: TipBubbleProps) {
	const bubble = useRef<HTMLElement>(null);

	const close = () => {
		const hadFocus = bubble.current?.contains(document.activeElement);
		onClose();
		if (hadFocus) returnFocus();
	};

	return (
		<section
			ref={bubble}
			aria-label="Tip from the Orbi cat"
			className="absolute top-[calc(100%+12px)] right-0 z-40 flex w-64 flex-col items-start gap-2.5 rounded-2xl bg-popover py-3 pr-9 pl-3.5 text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-1 motion-safe:duration-200"
		>
			<span
				aria-hidden="true"
				className="absolute -top-1.5 right-3.5 size-3 rotate-45 border-t border-l border-foreground/10 bg-popover"
			/>
			<p className="leading-snug">{tip.text}</p>
			{tip.action && (
				<Button asChild size="sm" className="h-8 rounded-full px-3.5">
					<Link href={tip.action.href}>{tip.action.label}</Link>
				</Button>
			)}
			<Button
				variant="ghost"
				size="icon-sm"
				onClick={close}
				aria-label="Close tip"
				className="absolute top-1.5 right-1.5 rounded-full text-muted-foreground"
			>
				<XIcon />
			</Button>
		</section>
	);
}
