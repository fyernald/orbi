import type { Tip } from './tips';

export const MASCOT_HIDDEN_MESSAGE =
	'The cat is hidden. You can turn it back on in Settings.';

type AnnouncementInput = {
	// why hiding the cat failed
	hideError?: string;
	// the student just hid the cat
	hidden: boolean;
	tip: Tip | null;
};

// What screen readers hear from the cat: things that happen without the focus
// moving, like a tip that comes up or the cat that is gone after Hide
export function mascotAnnouncement({
	hideError,
	hidden,
	tip,
}: AnnouncementInput): string {
	if (hideError) return hideError;
	if (hidden) return MASCOT_HIDDEN_MESSAGE;
	return tip ? `Tip from the Orbi cat: ${tip.text}` : '';
}
