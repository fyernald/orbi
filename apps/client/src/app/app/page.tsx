import type { Metadata } from 'next';
import { HomeGreeting } from '@/features/home/components/home-greeting';
import { NoteComposer } from '@/features/home/components/note-composer';
import { SuggestionChips } from '@/features/home/components/suggestion-chips';
import {
	defaultModelId,
	models,
	recentTopics,
	today,
} from '@/features/home/mock-data';
import { suggestionsFor } from '@/features/home/suggestions';

export const metadata: Metadata = { title: 'Home' };

export default function HomePage() {
	return (
		<section className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-12 sm:px-8 md:gap-10">
			<HomeGreeting />
			<div className="flex w-full max-w-190 flex-col gap-6">
				<NoteComposer
					topics={recentTopics}
					models={models}
					defaultModelId={defaultModelId}
				/>
				<SuggestionChips suggestions={suggestionsFor(today)} />
			</div>
		</section>
	);
}
