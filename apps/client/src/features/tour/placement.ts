export type Box = { top: number; left: number; width: number; height: number };
export type Size = { width: number; height: number };

// right: beside a part on the left of the page, like the sidebar; docked: at the
// bottom of a phone's screen; center: no part to point at
export type CardSide = 'right' | 'below' | 'above' | 'docked' | 'center';
export type CardPlacement = { top: number; left: number; side: CardSide };

// below this width the card sits at the bottom of the screen
export const PHONE_MAX_WIDTH = 640;
// between the card and the part it points at, and from the screen's edges
const GAP = 12;
const EDGE = 16;
// the room left around the part inside the spotlight
export const SPOTLIGHT_PADDING = 6;

const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), Math.max(min, max));

// Where the card goes for a part of the page (in viewport pixels), so it never
// covers that part and stays on screen
export function placeCard(
	target: Box | null,
	card: Size,
	viewport: Size
): CardPlacement {
	const maxTop = viewport.height - card.height - EDGE;
	const maxLeft = viewport.width - card.width - EDGE;

	if (viewport.width < PHONE_MAX_WIDTH) {
		return { top: maxTop, left: EDGE, side: 'docked' };
	}
	if (!target) {
		return {
			top: Math.max(EDGE, (viewport.height - card.height) / 2),
			left: Math.max(EDGE, (viewport.width - card.width) / 2),
			side: 'center',
		};
	}

	const right = target.left + target.width + GAP;
	const bottom = target.top + target.height + GAP;
	const centeredLeft = clamp(
		target.left + target.width / 2 - card.width / 2,
		EDGE,
		maxLeft
	);

	if (
		target.left < viewport.width / 3 &&
		right + card.width + EDGE <= viewport.width
	) {
		return {
			top: clamp(
				target.top + target.height / 2 - card.height / 2,
				EDGE,
				maxTop
			),
			left: right,
			side: 'right',
		};
	}
	if (bottom + card.height + EDGE <= viewport.height) {
		return { top: bottom, left: centeredLeft, side: 'below' };
	}
	const above = target.top - GAP - card.height;
	if (above >= EDGE) return { top: above, left: centeredLeft, side: 'above' };
	// a part taller than the screen: the card keeps to the bottom, over it
	return { top: maxTop, left: centeredLeft, side: 'below' };
}

// the lit area around a part, a little larger than it
export function spotlightBox(target: Box): Box {
	return {
		top: target.top - SPOTLIGHT_PADDING,
		left: target.left - SPOTLIGHT_PADDING,
		width: target.width + SPOTLIGHT_PADDING * 2,
		height: target.height + SPOTLIGHT_PADDING * 2,
	};
}
