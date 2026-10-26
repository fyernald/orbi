import { HomeFootnote } from '@/features/home/components/home-footnote';
import { HomeGreeting } from '@/features/home/components/home-greeting';
import { NoteComposer } from '@/features/home/components/note-composer';
import { SuggestionChips } from '@/features/home/components/suggestion-chips';
import { nextUp, suggestions } from '@/features/home/mock-data';

export default function HomePage() {
	return (
		<div className="flex flex-1 flex-col">
			<section className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-12 sm:px-8 md:gap-10">
				<HomeGreeting headline={nextUp.headline} />
				<div className="flex w-full max-w-190 flex-col gap-4">
					<NoteComposer course={nextUp.course} topic={nextUp.topic} />
					<SuggestionChips suggestions={suggestions} />
				</div>
			</section>
			<HomeFootnote />
		</div>
	);
}
