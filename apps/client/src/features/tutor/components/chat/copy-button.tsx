'use client';

import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';

// how long "Copied" shows before the button reads "Copy" again
const COPIED_MS = 2000;

// copies a reply; says "Copied" for a moment, and tells screen readers too
export function CopyButton({ text }: { text: string }) {
	const [copied, setCopied] = useState(false);
	useEffect(() => {
		if (!copied) return;
		const timer = setTimeout(() => setCopied(false), COPIED_MS);
		return () => clearTimeout(timer);
	}, [copied]);

	const copy = () =>
		navigator.clipboard
			?.writeText(text)
			.then(() => setCopied(true))
			.catch(() => {});

	return (
		<>
			<button
				type="button"
				onClick={() => void copy()}
				className="flex items-center gap-1 rounded-md px-1.5 py-1 hover:bg-muted hover:text-foreground"
			>
				{copied ? (
					<Check className="size-3.5" />
				) : (
					<Copy className="size-3.5" />
				)}
				{copied ? 'Copied' : 'Copy'}
			</button>
			<span aria-live="polite" className="sr-only">
				{copied ? 'Copied to the clipboard' : ''}
			</span>
		</>
	);
}
