import { createChartInput, createChartOutput } from '@orbi/shared';
import { tool } from 'ai';
import type { VisualBudget } from './visual-budget';

// The AI sends the numbers or formulas; the browser draws the chart in Orbi's
// colours. Nothing is saved apart from the reply itself.
export const createChartTool = (visuals: VisualBudget) =>
	tool({
		description:
			'Draw a chart in the chat: bar, line, area, pie, scatter, histogram, or a plot of formulas. Use it when numbers, a trend, a comparison, a share or a function are much easier to see than to read.',
		inputSchema: createChartInput,
		outputSchema: createChartOutput,
		execute: async () => {
			visuals.take();
			return { shown: true as const };
		},
	});
