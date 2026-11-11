'use client';

import { pickPalette, usePalette } from '@/hooks/use-palette';
import { PALETTE_LABELS, PALETTES, type Palette } from '@/lib/palette';
import { cn } from '@/lib/utils';

// each swatch shows its theme's main colour (--palette-* in globals.css)
const swatchColor: Record<Palette, string> = {
	berry: '[--swatch:var(--palette-berry)]',
	ocean: '[--swatch:var(--palette-ocean)]',
	violet: '[--swatch:var(--palette-violet)]',
	forest: '[--swatch:var(--palette-forest)]',
};

// The ring around the picked swatch comes from the page's data-palette in CSS, so it
// is right from the first paint; aria-pressed follows once the page has loaded
export function PalettePicker() {
	const current = usePalette();

	return (
		<div
			role="group"
			aria-label="Colour theme"
			className="flex h-8 items-center gap-1.5 rounded-full px-2 shadow-[inset_0_0_0_1px_var(--border)]"
		>
			{PALETTES.map((palette) => (
				<button
					key={palette}
					type="button"
					aria-label={PALETTE_LABELS[palette]}
					title={PALETTE_LABELS[palette]}
					aria-pressed={current === palette}
					data-swatch={palette}
					onClick={() => pickPalette(palette)}
					className={cn(
						'palette-swatch size-4 rounded-full bg-(--swatch) hover:scale-110 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
						swatchColor[palette]
					)}
				/>
			))}
		</div>
	);
}
