import { describe, expect, it } from 'vitest';
import { placeCard, spotlightBox } from './placement';

const card = { width: 320, height: 180 };
const desktop = { width: 1440, height: 900 };

describe('placeCard', () => {
	it('docks the card at the bottom of a phone screen', () => {
		expect(
			placeCard({ top: 10, left: 10, width: 40, height: 40 }, card, {
				width: 390,
				height: 844,
			})
		).toEqual({ top: 844 - 180 - 16, left: 16, side: 'docked' });
	});

	it('centres the card when there is nothing to point at', () => {
		expect(placeCard(null, card, desktop)).toEqual({
			top: (900 - 180) / 2,
			left: (1440 - 320) / 2,
			side: 'center',
		});
	});

	it('puts the card beside a sidebar item, level with it', () => {
		const link = { top: 200, left: 24, width: 220, height: 36 };

		expect(placeCard(link, card, desktop)).toEqual({
			top: 200 + 18 - 90,
			left: 24 + 220 + 12,
			side: 'right',
		});
	});

	it('keeps a card beside the bottom of the sidebar on screen', () => {
		const account = { top: 840, left: 24, width: 220, height: 48 };

		expect(placeCard(account, card, desktop).top).toBe(900 - 180 - 16);
	});

	it('puts the card under a part in the middle of the page', () => {
		const composer = { top: 300, left: 500, width: 700, height: 150 };

		expect(placeCard(composer, card, desktop)).toEqual({
			top: 462,
			left: 500 + 350 - 160,
			side: 'below',
		});
	});

	it('puts the card above a part near the bottom', () => {
		const box = { top: 700, left: 500, width: 400, height: 120 };

		expect(placeCard(box, card, desktop)).toMatchObject({
			top: 700 - 12 - 180,
			side: 'above',
		});
	});

	it('keeps the card inside the screen next to its right edge', () => {
		const button = { top: 12, left: 1340, width: 90, height: 36 };

		expect(placeCard(button, card, desktop).left).toBe(1440 - 320 - 16);
	});

	it('keeps to the bottom when the part fills the screen', () => {
		const tall = { top: 20, left: 500, width: 600, height: 860 };

		expect(placeCard(tall, card, desktop)).toMatchObject({
			top: 900 - 180 - 16,
			side: 'below',
		});
	});
});

describe('spotlightBox', () => {
	it('leaves a little room around the part', () => {
		expect(
			spotlightBox({ top: 100, left: 50, width: 200, height: 40 })
		).toEqual({ top: 94, left: 44, width: 212, height: 52 });
	});
});
