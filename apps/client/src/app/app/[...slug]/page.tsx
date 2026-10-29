import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { routes } from '@/lib/routes';

export const metadata: Metadata = { title: 'Not ready yet' };

const plannedPages = new Set<string>(Object.values(routes));

// pages linked from the app that are not built yet land here instead of a 404;
// a real page at the same path takes over automatically
export default async function PlannedPage({
	params,
}: {
	params: Promise<{ slug: string[] }>;
}) {
	const { slug } = await params;
	if (!plannedPages.has(`${routes.app}/${slug.join('/')}`)) notFound();

	return (
		<section className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-12 text-center">
			<h1 className="text-xl font-medium tracking-tight">
				This page is not ready yet
			</h1>
			<p className="max-w-sm text-sm text-muted-foreground">
				It is planned for a later sprint.
			</p>
			<Button asChild variant="outline" className="mt-2 h-9 rounded-full px-4">
				<Link href={routes.app}>Back to home</Link>
			</Button>
		</section>
	);
}
