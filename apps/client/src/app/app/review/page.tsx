import type { Metadata } from 'next';
import { ReviewSummary } from '@/features/questions/components/review-summary';
import { ReviewView } from '@/features/questions/components/review-view';

export const metadata: Metadata = { title: 'Review questions' };

export default function ReviewPage() {
	return (
		<section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 md:px-7">
			<header className="flex flex-col gap-1">
				<h1 className="text-2xl font-semibold tracking-tight">
					Review questions
				</h1>
				<ReviewSummary />
			</header>
			<ReviewView />
		</section>
	);
}
