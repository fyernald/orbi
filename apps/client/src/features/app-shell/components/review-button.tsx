import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { routes } from '@/lib/routes';

// a shortcut to today's review from every page; gone when nothing is due
export function ReviewButton({ dueCount }: { dueCount: number }) {
	if (dueCount === 0) return null;

	return (
		<Button asChild className="h-9 rounded-full px-4">
			<Link href={routes.studySession}>
				<span className="tabular-nums">{dueCount} due</span>
				<span aria-hidden="true" className="hidden sm:inline">
					·
				</span>
				<span className="hidden sm:inline">Review</span>
			</Link>
		</Button>
	);
}
