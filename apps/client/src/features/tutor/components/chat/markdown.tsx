'use client';

import 'katex/dist/katex.min.css';
import 'streamdown/styles.css';
import { math } from '@streamdown/math';
import { useMemo } from 'react';
import { defaultRehypePlugins, Streamdown } from 'streamdown';
import { cn } from '@/lib/utils';
import { normalizeMath } from '../../math';
import { alignNumericColumns } from '../../numeric-columns';
import {
	ChatTable,
	ChatTableCell,
	ChatTableHead,
	ChatTableHeaderCell,
} from './markdown-table';

const plugins = { math };
const rehypePlugins = [
	...Object.values(defaultRehypePlugins),
	alignNumericColumns,
];
const components = {
	table: ChatTable,
	thead: ChatTableHead,
	th: ChatTableHeaderCell,
	td: ChatTableCell,
};

// The AI's markdown. Streamdown copes with half-written markdown while it streams,
// and removes raw HTML and unsafe links.
export function Markdown({
	text,
	streaming,
	className,
}: {
	text: string;
	streaming: boolean;
	className?: string;
}) {
	const markdown = useMemo(() => normalizeMath(text), [text]);
	return (
		<Streamdown
			plugins={plugins}
			rehypePlugins={rehypePlugins}
			components={components}
			isAnimating={streaming}
			animated
			className={cn(
				'min-w-0 text-[15px] leading-relaxed text-foreground [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-3',
				className
			)}
		>
			{markdown}
		</Streamdown>
	);
}
