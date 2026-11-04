import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { routes } from '@/lib/routes';

// Home before the student has a topic to ask about
export function NoTopicsYet() {
	return (
		<div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border px-6 py-8 text-center">
			<p className="max-w-sm text-sm text-muted-foreground">
				Add a course with its topics and notes, then ask Orbi about them here.
			</p>
			<Button asChild className="h-9 rounded-full px-4">
				<Link href={routes.newCourse}>Add a course</Link>
			</Button>
		</div>
	);
}
