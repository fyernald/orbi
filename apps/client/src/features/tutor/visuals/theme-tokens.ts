import { cssColorToHex } from './colors';

// the app's colours a visual is drawn with, read from the CSS tokens
export type ThemeTokens = {
	card: string;
	foreground: string;
	mutedForeground: string;
	muted: string;
	border: string;
	// --chart-1 to --chart-6, in their fixed order
	charts: readonly string[];
	fontFamily: string;
};

const token = (style: CSSStyleDeclaration, name: string) =>
	cssColorToHex(style.getPropertyValue(name).trim());

// the tokens of the theme on screen now (light or dark)
export function readThemeTokens(): ThemeTokens {
	const root = getComputedStyle(document.documentElement);
	return {
		card: token(root, '--card'),
		foreground: token(root, '--foreground'),
		mutedForeground: token(root, '--muted-foreground'),
		muted: token(root, '--muted'),
		border: token(root, '--border'),
		charts: [1, 2, 3, 4, 5, 6].map((number) =>
			token(root, `--chart-${number}`)
		),
		fontFamily: getComputedStyle(document.body).fontFamily,
	};
}
