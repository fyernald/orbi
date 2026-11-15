import { describe, expect, it } from 'vitest';
import { MASCOT_HIDDEN_MESSAGE, mascotAnnouncement } from './announcement';

const tip = { id: 'first-course', text: 'Make your first course.' } as const;

describe('mascotAnnouncement', () => {
	it('reads out a tip as it comes up', () => {
		expect(mascotAnnouncement({ hidden: false, tip })).toBe(
			'Tip from the Orbi cat: Make your first course.'
		);
	});

	it('says where the cat went after Hide', () => {
		expect(mascotAnnouncement({ hidden: true, tip: null })).toBe(
			MASCOT_HIDDEN_MESSAGE
		);
	});

	it('gives the reason when hiding failed', () => {
		expect(
			mascotAnnouncement({ hideError: 'Offline.', hidden: false, tip })
		).toBe('Offline.');
	});

	it('says nothing otherwise', () => {
		expect(mascotAnnouncement({ hidden: false, tip: null })).toBe('');
	});
});
