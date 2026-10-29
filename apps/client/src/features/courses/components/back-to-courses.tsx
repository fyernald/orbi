import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { routes } from '@/lib/routes';

export function BackToCourses() {
	return (
		<Link
			href={routes.courses}
			className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
		>
			<ArrowLeft className="size-4" />
			All courses
		</Link>
	);
}
