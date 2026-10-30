'use client';

import { useEffect, useRef } from 'react';

type QuestionHeaderProps = {
	heading: string;
	why: string;
	// moves focus here, so a screen reader reads the new question; steps with a text input focus that instead
	focusOnShow: boolean;
};

export function QuestionHeader({
	heading,
	why,
	focusOnShow,
}: QuestionHeaderProps) {
	const headingRef = useRef<HTMLHeadingElement>(null);

	useEffect(() => {
		if (focusOnShow) headingRef.current?.focus({ preventScroll: true });
	}, [focusOnShow]);

	return (
		<div className="flex flex-col gap-3">
			<h1
				ref={headingRef}
				tabIndex={-1}
				className="text-3xl font-semibold tracking-tight text-balance outline-none sm:text-4xl"
			>
				{heading}
			</h1>
			<p className="text-base text-pretty text-muted-foreground">{why}</p>
		</div>
	);
}
