import { createInteractiveInput, createInteractiveOutput } from '@orbi/shared';
import { tool } from 'ai';
import type { VisualBudget } from './visual-budget';

// The AI sends controls and formulas; the browser builds the tool from them and
// works the formulas out as the student moves the controls. No code runs.
export const createInteractiveTool = (visuals: VisualBudget) =>
	tool({
		description:
			'Build a small interactive tool in the chat: sliders, number inputs, steppers, toggles or dropdowns linked by formulas to values and a chart of curves that change live. Use it when playing with a quantity shows an idea best, like a z-score and the area under the normal curve, a projectile, compound interest or a sine wave.',
		inputSchema: createInteractiveInput,
		outputSchema: createInteractiveOutput,
		execute: async () => {
			visuals.take();
			return { shown: true as const };
		},
	});
