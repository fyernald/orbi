import { X } from 'lucide-react';
import Link from 'next/link';
import { OrbitRing } from '@/components/orbit-ring';
import { Button } from '@/components/ui/button';
import { courseRoute } from '@/lib/routes';
import { SessionTitle } from './session-title';

type SessionAsideProps = {
	courseId: string;
	courseName: string;
	topicName: string;
	// left out when there is nothing to answer
	progress?: { done: number; total: number };
};

// the left part of a wide page: where the questions come from, and how far along
// the run is as a moon going round its orbit
export function SessionAside({
	courseId,
	courseName,
	topicName,
	progress,
}: SessionAsideProps) {
	return (
		<>
			<SessionTitle courseName={courseName} topicName={topicName} />
			{progress && (
				<div
					role="progressbar"
					aria-label="Questions answered"
					aria-valuemin={0}
					aria-valuemax={progress.total}
					aria-valuenow={progress.done}
					className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-4 py-6"
				>
					<OrbitRing
						value={(progress.done / progress.total) * 100}
						className="size-32 text-primary"
					>
						<span className="flex flex-col items-center">
							<span className="text-3xl font-semibold tracking-tight tabular-nums">
								{progress.done}
							</span>
							<span className="text-xs text-muted-foreground tabular-nums">
								of {progress.total} done
							</span>
						</span>
					</OrbitRing>
				</div>
			)}
			<Button
				asChild
				variant="ghost"
				className="h-9 self-start rounded-full px-3 text-muted-foreground"
			>
				<Link href={courseRoute(courseId)}>
					<X />
					End the session
				</Link>
			</Button>
		</>
	);
}
