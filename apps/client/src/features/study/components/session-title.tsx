import { cn } from '@/lib/utils';

type SessionTitleProps = {
	courseName: string;
	topicName: string;
	className?: string;
};

export function SessionTitle({
	courseName,
	topicName,
	className,
}: SessionTitleProps) {
	return (
		<div className={cn('flex min-w-0 flex-col gap-0.5', className)}>
			<p className="truncate text-sm text-muted-foreground">{courseName}</p>
			<h1 className="text-2xl font-semibold tracking-tight break-words">
				{topicName}
			</h1>
		</div>
	);
}
