// Styles every mini-app starts from, so one that sets none still looks like Orbi
// in light and dark mode. The mini-app's own CSS comes after and wins. The font and
// colour are set on html too, for a mini-app that sets its body to inherit them.
export const BASE_STYLE = `
*, *::before, *::after { box-sizing: border-box; }
html {
	background: var(--orbi-background);
	color: var(--orbi-foreground);
	font: 14px/1.5 var(--orbi-font);
}
body {
	margin: 0;
	padding: 12px;
	background: var(--orbi-background);
	color: var(--orbi-foreground);
	font: 14px/1.5 var(--orbi-font);
	overflow-wrap: anywhere;
}
canvas, svg, img, video { max-width: 100%; }
button, input, select, textarea { font: inherit; color: inherit; }
button, select {
	background: var(--orbi-muted);
	border: 1px solid var(--orbi-border);
	border-radius: 8px;
	padding: 6px 12px;
	cursor: pointer;
}
input[type="range"], input[type="checkbox"], input[type="radio"] {
	accent-color: var(--orbi-primary);
}
:focus-visible { outline: 2px solid var(--orbi-primary); outline-offset: 2px; }
`;
