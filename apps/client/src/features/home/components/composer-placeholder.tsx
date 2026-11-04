// holds the message box's place while the topics load, so the page does not jump
export function ComposerPlaceholder() {
	return (
		<div
			aria-hidden="true"
			className="h-38 animate-pulse rounded-3xl border border-border bg-card motion-reduce:animate-none"
		/>
	);
}
