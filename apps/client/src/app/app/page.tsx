import type { Metadata } from 'next';
import { HomeComposer } from '@/features/home/components/home-composer';
import { HomeGreeting } from '@/features/home/components/home-greeting';
import { SuggestionChips } from '@/features/home/components/suggestion-chips';
import { getServerProfile } from '@/features/profile/server';
import { TodayCard } from '@/features/today/components/today-card';

export const metadata: Metadata = { title: 'Home' };

// the /app layout has checked the session and loaded the profile; this call shares its result
export default async function HomePage() {
	const { preferredName } = await getServerProfile();

	// On a wide screen, today's review sits beside the message box instead of under
	// it, so it is seen first and the page is not a thin column. Without the panel
	// (no courses yet) the message box keeps its own width.
	return (
		<section className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-8">
			<div className="flex w-full max-w-190 flex-col gap-8 xl:has-[[data-today]]:max-w-300 xl:has-[[data-today]]:flex-row xl:has-[[data-today]]:items-center xl:has-[[data-today]]:gap-12 2xl:has-[[data-today]]:max-w-340 2xl:has-[[data-today]]:gap-16">
				<div className="flex min-w-0 flex-1 flex-col gap-6 md:gap-8">
					<HomeGreeting name={preferredName ?? ''} />
					<div className="flex flex-col gap-6">
						<HomeComposer />
						<SuggestionChips />
					</div>
				</div>
				<TodayCard />
			</div>
		</section>
	);
}
