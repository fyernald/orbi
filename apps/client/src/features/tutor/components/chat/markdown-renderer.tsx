'use client';

import 'katex/dist/katex.min.css';
import 'streamdown/styles.css';
import { math } from '@streamdown/math';
import { useMemo } from 'react';
import { defaultRehypePlugins, Streamdown } from 'streamdown';
import { cn } from '@/lib/utils';
import { CODE_THEMES, lazyCodeHighlighter } from '../../code-highlighter';
import { normalizeMath } from '../../math';
import { markdownClassName } from './markdown';
import { alignNumericColumns } from '../../numeric-columns';
import {
	ChatTable,
	ChatTableCell,
	ChatTableHead,
	ChatTableHeaderCell,
} from './markdown-table';

const plugins = { math, code: lazyCodeHighlighter(CODE_THEMES) };
// code blocks get a copy button; a download is not needed for a snippet
const controls = { code: { download: false } };
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

export type MarkdownProps = {
	text: string;
	streaming: boolean;
	className?: string;
};

// The AI's markdown. Streamdown copes with half-written markdown while it streams,
// and removes raw HTML and unsafe links. Load it through Markdown in markdown.tsx.
export default function MarkdownRenderer({
	text,
	streaming,
	className,
}: MarkdownProps) {
	const markdown = useMemo(() => normalizeMath(text), [text]);
	return (
		<Streamdown
			plugins={plugins}
			shikiTheme={CODE_THEMES}
			controls={controls}
			rehypePlugins={rehypePlugins}
			components={components}
			isAnimating={streaming}
			animated
			className={cn(markdownClassName, className)}
		>
			{markdown}
		</Streamdown>
	);
}
