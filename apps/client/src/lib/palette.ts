// The colour themes. Each one is a block of tokens in globals.css, found by the
// data-palette attribute on <html>; Berry is Orbi's own and needs no block.
// To add one, add it here and give it a light and a dark block there.
export const PALETTES = ['berry', 'ocean', 'violet', 'forest'] as const;
export type Palette = (typeof PALETTES)[number];

export const PALETTE_LABELS: Record<Palette, string> = {
	berry: 'Berry',
	ocean: 'Ocean',
	violet: 'Violet',
	forest: 'Forest',
};

// remembered in a cookie, so the server already draws the page in it after a refresh
export const PALETTE_COOKIE = 'palette';

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function readPalette(cookieValue: string | undefined): Palette {
	return PALETTES.find((palette) => palette === cookieValue) ?? 'berry';
}

// browser only
export function savePalette(palette: Palette): void {
	document.cookie = `${PALETTE_COOKIE}=${palette}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
}
