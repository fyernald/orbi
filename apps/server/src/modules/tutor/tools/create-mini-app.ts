import { createMiniAppInput, createMiniAppOutput } from '@orbi/shared';
import { tool } from 'ai';
import { jsSyntaxProblem } from './js-syntax';
import type { VisualBudget } from './visual-budget';

// The AI writes HTML, CSS and JavaScript; the browser runs them only in the
// sandbox page, on its own origin with no network. The server checks the syntax,
// so the AI can fix a mistake in the same reply instead of showing a broken app.
export const createMiniAppTool = (visuals: VisualBudget) =>
	tool({
		description:
			'Build a small app in the chat from HTML, CSS and JavaScript, run in a sandbox with no network. Use it only for what createInteractive cannot do: a simulation or animation, an algorithm step by step (like a sort), or a small game. It may load chart.js, d3 or p5.',
		inputSchema: createMiniAppInput,
		outputSchema: createMiniAppOutput,
		execute: async ({ js }) => {
			const problem = jsSyntaxProblem(js);
			if (problem) throw new Error(problem);
			visuals.take();
			return { shown: true as const };
		},
	});
