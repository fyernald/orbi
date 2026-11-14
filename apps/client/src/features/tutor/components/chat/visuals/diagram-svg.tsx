import { cn } from '@/lib/utils';

// Mermaid's SVG, already cleaned by Mermaid's strict mode. Screen readers get the
// description from the card instead. A wide diagram scrolls inside the card, not
// the page; full screen lets it grow to the dialog's width.
export function DiagramSvg({ svg, large }: { svg: string; large?: boolean }) {
	return (
		<div
			aria-hidden
			className={cn(
				'flex justify-center overflow-x-auto [&_svg]:h-auto',
				large && '[&_svg]:w-full [&_svg]:max-w-none!'
			)}
			dangerouslySetInnerHTML={{ __html: svg }}
		/>
	);
}
