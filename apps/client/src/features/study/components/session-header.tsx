import { X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { courseRoute } from '@/lib/routes';
import type { MapItem } from '../question-map';
import { QuestionStrip } from './question-strip';
import { SessionTitle } from './session-title';

type SessionHeaderProps = {
	courseId: string;
	courseName: string;
	topicName: string;
	// left out when there is nothing to answer
	progress?: { shown: number; items: MapItem[] };
};

// The top of the page while it is one column; wider pages show this in the side
// parts. Every answer is saved as it is given, so leaving early loses nothing.
export function SessionHeader({
	courseId,
	courseName,
	topicName,
	progress,
}: SessionHeaderProps) {
	return (
		<header className="flex flex-col gap-4 @5xl:hidden">
			<div className="flex items-start gap-3">
				<SessionTitle
					courseName={courseName}
					topicName={topicName}
					className="flex-1"
				/>
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
					<div className="flex-1">
						<QuestionStrip items={progress.items} />
					</div>
					<span className="text-xs text-muted-foreground tabular-nums">
						{progress.shown} of {progress.items.length}
					</span>
				</div>
			)}
		</header>
	);
}
