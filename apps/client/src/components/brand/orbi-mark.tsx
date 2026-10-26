import { cn } from '@/lib/utils';

export function OrbiMark({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 32 32"
			aria-hidden="true"
			className={cn('size-7 shrink-0', className)}
		>
			<circle cx="16" cy="16" r="16" className="fill-primary" />
			<circle cx="16" cy="16" r="7" className="fill-primary-foreground" />
			<circle cx="22.5" cy="9.5" r="2.5" className="fill-primary-foreground" />
		</svg>
	);
}
