import type { Metadata } from 'next';
import { HomeGreeting } from '@/features/home/components/home-greeting';
import { NoteComposer } from '@/features/tutor/components/note-composer';
import { SuggestionChips } from '@/features/home/components/suggestion-chips';
import { recentTopics, today } from '@/features/home/mock-data';
import { suggestionsFor } from '@/features/home/suggestions';
import { getServerProfile } from '@/features/profile/server';

export const metadata: Metadata = { title: 'Home' };

// the /app layout has checked the session and loaded the profile; this call shares its result
export default async function HomePage() {
	const { preferredName } = await getServerProfile();

	return (
		<section className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-8 sm:px-8 md:gap-8">
			<HomeGreeting name={preferredName ?? ''} />
			<div className="flex w-full max-w-190 flex-col gap-6">
				<NoteComposer topics={recentTopics} />
				<SuggestionChips suggestions={suggestionsFor(today)} />
			</div>
		</section>
	);
}
