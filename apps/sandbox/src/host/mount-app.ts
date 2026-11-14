import type { MiniAppCode } from '@orbi/shared/mini-app-protocol';
import { BASE_STYLE } from './base-style';

const addStyle = (css: string) => {
	const style = document.createElement('style');
	style.textContent = css;
	document.head.append(style);
};

// the mini-app's styles and markup, before its code runs
export function mountApp({ html, css }: MiniAppCode) {
	addStyle(BASE_STYLE);
	if (css) addStyle(css);
	document.body.innerHTML = html;
}

// Runs the mini-app's code as a script of the page. A script runs as soon as it is
// added, so an error thrown at the top level has already been reported when this
// returns.
export function runScript(js: string) {
	const script = document.createElement('script');
	script.textContent = js;
	document.body.append(script);
}
