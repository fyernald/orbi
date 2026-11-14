import type { Palette } from './palette';

// The browser bar on phones takes the page's background. Next.js needs the colours
// as text, so they are copied from --background in globals.css; a test keeps them equal.
export const browserBarColors: Record<
	Palette,
	{ light: string; dark: string }
> = {
	berry: { light: '#fcf9fa', dark: '#140d10' },
	ocean: { light: '#f8fafc', dark: '#0c1015' },
	violet: { light: '#fafafc', dark: '#0f0e15' },
	forest: { light: '#f8fbf9', dark: '#0a110d' },
};
