import { z } from 'zod';
import { CHART_FUNCTIONS_MAX, CHART_NAME_MAX_LENGTH } from './charts';
import { FORMULA_MAX_LENGTH } from './formula';
import {
	CONTROL_TYPES,
	INTERACTIVE_CONTROLS_MAX,
	INTERACTIVE_MARKERS_MAX,
	INTERACTIVE_VALUES_MAX,
	SELECT_OPTIONS_MAX,
	UNIT_MAX_LENGTH,
	VALUE_DECIMALS_MAX,
	VARIABLE_NAME_MAX_LENGTH,
} from './interactive-limits';
import { interactiveProblems } from './interactive-problems';
import { visualDescription, visualTitle } from './visuals';

// What the createInteractive tool takes (US-42): a small tool of controls, values
// worked out from them and a chart of curves, all written as formulas. The
// browser runs the formula language, never code, so a tool cannot do more than
// draw. Like createChart, it is one flat object checked by type below.

const shortName = z.string().trim().min(1).max(CHART_NAME_MAX_LENGTH);

const formula = z.string().trim().min(1).max(FORMULA_MAX_LENGTH);

const variableName = z
	.string()
	.trim()
	.regex(
		new RegExp(`^[a-zA-Z][a-zA-Z0-9_]{0,${VARIABLE_NAME_MAX_LENGTH - 1}}$`),
		'Use a short name of letters and digits that starts with a letter, like z or angle.'
	)
	.describe('The name formulas use for it, like z or angle.');

const control = z.object({
	name: variableName,
	label: shortName.describe('What the student sees, like "z-score".'),
	type: z.enum(CONTROL_TYPES),
	min: z
		.number()
		.optional()
		.describe('slider, number, stepper: the lowest value.'),
	max: z
		.number()
		.optional()
		.describe('slider, number, stepper: the highest value.'),
	step: z
		.number()
		.positive()
		.optional()
		.describe('slider, number, stepper: one step. Left out, the app picks.'),
	value: z
		.number()
		.describe(
			'Where it starts. toggle: 0 for off or 1 for on. select: one of the option values.'
		),
	options: z
		.array(z.object({ label: shortName, value: z.number() }))
		.max(SELECT_OPTIONS_MAX)
		.optional()
		.describe('select: the choices, each with the number it stands for.'),
});

const readout = z.object({
	name: variableName,
	label: shortName.describe('What the student sees, like "P(Z ≤ z)".'),
	expression: formula.describe(
		'Worked out from the controls and the values above it, like normcdf(z).'
	),
	decimals: z
		.number()
		.int()
		.min(0)
		.max(VALUE_DECIMALS_MAX)
		.optional()
		.describe('How many decimals to show. Left out, up to 2.'),
	unit: z
		.string()
		.trim()
		.max(UNIT_MAX_LENGTH)
		.optional()
		.describe('Shown after the number, like m/s or %.'),
});

const curve = z.object({
	name: shortName.describe('Shown in the legend and the tooltip.'),
	expression: formula.describe(
		'y in terms of x and the names of controls and values, like normpdf(x).'
	),
	shadeFrom: formula
		.optional()
		.describe(
			'Shade the area under the curve from this x, a formula of controls and values. Left out with shadeTo given, from the left edge.'
		),
	shadeTo: formula
		.optional()
		.describe(
			'Shade up to this x. Left out with shadeFrom given, to the right edge.'
		),
});

const marker = z.object({
	label: shortName,
	x: formula.describe('Where to draw an upright line, like z.'),
});

const chart = z.object({
	xLabel: shortName,
	yLabel: shortName,
	xMin: z.number(),
	xMax: z.number(),
	yMin: z
		.number()
		.optional()
		.describe('Give yMin and yMax when the curves move, so the axis stays.'),
	yMax: z.number().optional(),
	curves: z.array(curve).min(1).max(CHART_FUNCTIONS_MAX),
	markers: z.array(marker).max(INTERACTIVE_MARKERS_MAX).optional(),
});

export const createInteractiveFields = z.object({
	title: visualTitle,
	controls: z.array(control).min(1).max(INTERACTIVE_CONTROLS_MAX),
	values: z
		.array(readout)
		.max(INTERACTIVE_VALUES_MAX)
		.optional()
		.describe('Numbers worked out from the controls, shown as results.'),
	chart: chart
		.optional()
		.describe('Curves that change with the controls. Needs no data points.'),
	description: visualDescription,
});

export type InteractiveFields = z.infer<typeof createInteractiveFields>;
export type InteractiveControl = InteractiveFields['controls'][number];
export type InteractiveValue = NonNullable<InteractiveFields['values']>[number];
export type InteractiveChart = NonNullable<InteractiveFields['chart']>;
export type InteractiveCurve = InteractiveChart['curves'][number];

export const createInteractiveInput = createInteractiveFields.superRefine(
	(input, context) => {
		for (const { path, message } of interactiveProblems(input)) {
			context.addIssue({ code: 'custom', path, message });
		}
	}
);

// the tool is in the chat; the model writes its explanation next
export const createInteractiveOutput = z.object({ shown: z.literal(true) });

export type CreateInteractiveInput = z.infer<typeof createInteractiveInput>;
export type CreateInteractiveOutput = z.infer<typeof createInteractiveOutput>;
