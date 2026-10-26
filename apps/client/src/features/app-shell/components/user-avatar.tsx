import { cn } from '@/lib/utils';

export function UserAvatar({
	name,
	className,
}: {
	name: string;
	className?: string;
}) {
	return (
		<span
			aria-hidden="true"
			className={cn(
				'flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-medium text-accent-foreground',
				className
			)}
		>
			{name.charAt(0).toUpperCase()}
		</span>
	);
}
