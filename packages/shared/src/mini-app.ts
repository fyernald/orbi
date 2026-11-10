import { z } from 'zod';
import { MINI_APP_LIBRARIES, type MiniAppCode } from './mini-app-protocol';
import { visualDescription, visualTitle } from './visuals';

// What the createMiniApp tool takes (US-42 part 4): HTML, CSS and JavaScript the
// model writes, for what createInteractive cannot do (a simulation, a sort step by
// step, a small game). It runs only in the sandbox page, on its own origin, with
// no network (apps/sandbox).

export const MINI_APP_HTML_MAX_LENGTH = 8000;
export const MINI_APP_CSS_MAX_LENGTH = 8000;
export const MINI_APP_JS_MAX_LENGTH = 24_000;

const code = (max: number) => z.string().max(max);

// What is wrong with the model's HTML, in words it can fix, or undefined. The
// sandbox puts the HTML in the page as markup, so a script tag there would never run.
export function miniAppHtmlProblem(html: string): string | undefined {
	if (/<script[\s>]/i.test(html)) {
		return 'Put all JavaScript in js. Script tags in html do not run.';
	}
	if (/<(html|head|body)[\s>]/i.test(html)) {
		return 'Send only the markup inside the body, without html, head or body tags.';
	}
	return undefined;
}

export const createMiniAppInput = z
	.object({
		title: visualTitle,
		html: code(MINI_APP_HTML_MAX_LENGTH)
			.optional()
			.describe(
				'Markup inside the body only, like <canvas id="sim"></canvas> and labelled controls. No script tags.'
			),
		css: code(MINI_APP_CSS_MAX_LENGTH)
			.optional()
			.describe(
				'Styles. Use the theme variables, like var(--orbi-foreground) and var(--orbi-chart-1).'
			),
		js: code(MINI_APP_JS_MAX_LENGTH)
			.min(1)
			.describe(
				'Plain JavaScript that runs after the html is in the page. No imports and no network.'
			),
		libraries: z
			.array(z.enum(MINI_APP_LIBRARIES))
			.max(MINI_APP_LIBRARIES.length)
			.optional()
			.describe('Libraries to load first: chart.js (Chart), d3 or p5.'),
		description: visualDescription,
	})
	.superRefine(({ html, libraries }, context) => {
		const problem = html ? miniAppHtmlProblem(html) : undefined;
		if (problem) {
			context.addIssue({ code: 'custom', path: ['html'], message: problem });
		}
		if (libraries && new Set(libraries).size !== libraries.length) {
			context.addIssue({
				code: 'custom',
				path: ['libraries'],
				message: 'Name each library once.',
			});
		}
	});

// the mini-app is in the chat; the model writes its explanation next
export const createMiniAppOutput = z.object({ shown: z.literal(true) });

export type CreateMiniAppInput = z.infer<typeof createMiniAppInput>;
export type CreateMiniAppOutput = z.infer<typeof createMiniAppOutput>;

// the parts the sandbox runs, with the optional ones filled in
export const miniAppCode = ({
	html,
	css,
	js,
	libraries,
}: CreateMiniAppInput): MiniAppCode => ({
	html: html ?? '',
	css: css ?? '',
	js,
	libraries: libraries ?? [],
});
