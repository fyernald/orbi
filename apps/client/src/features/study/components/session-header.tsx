import { X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { courseRoute } from '@/lib/routes';

type SessionHeaderProps = {
	courseId: string;
	courseName: string;
	topicName: string;
	// left out when there is nothing to answer
	progress?: { shown: number; done: number; total: number };
};

// every answer is saved as it is given, so leaving early loses nothing
export function SessionHeader({
	courseId,
	courseName,
	topicName,
	progress,
}: SessionHeaderProps) {
	return (
		<header className="flex flex-col gap-4">
			<div className="flex items-start gap-3">
				<div className="flex min-w-0 flex-1 flex-col gap-0.5">
					<p className="truncate text-sm text-muted-foreground">{courseName}</p>
					<h1 className="truncate text-2xl font-semibold tracking-tight">
						{topicName}
					</h1>
				</div>
				<Button
					asChild
					variant="ghost"
					size="icon"
					className="shrink-0 rounded-full text-muted-foreground"
				>
					<Link href={courseRoute(courseId)} aria-label="End the session">
						<X />
					</Link>
				</Button>
			</div>
			{progress && (
				<div className="flex items-center gap-3">
					<div
						role="progressbar"
						aria-label="Questions answered"
						aria-valuemin={0}
						aria-valuemax={progress.total}
						aria-valuenow={progress.done}
						className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
					>
						<div
							className="h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none"
							style={{ width: `${(progress.done / progress.total) * 100}%` }}
						/>
					</div>
					<span className="text-xs text-muted-foreground tabular-nums">
						{progress.shown} of {progress.total}
					</span>
				</div>
			)}
		</header>
	);
}
