'use client';

import { lazy, Suspense } from 'react';
import { cn } from '@/lib/utils';
import type { MarkdownProps } from './markdown-renderer';

export const markdownClassName =
	'min-w-0 text-[15px] leading-relaxed text-foreground [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-3';

// Streamdown, KaTeX and their styles are a large part of the chat's code, and a
// course page has no reply to show at first. They load with the first reply, which
// shows its text as written until they are there.
const MarkdownRenderer = lazy(() => import('./markdown-renderer'));

export function Markdown(props: MarkdownProps) {
	return (
		<Suspense
			fallback={
				<div
					className={cn(
						markdownClassName,
						'whitespace-pre-wrap',
						props.className
					)}
				>
					{props.text}
				</div>
			}
		>
			<MarkdownRenderer {...props} />
		</Suspense>
	);
}
