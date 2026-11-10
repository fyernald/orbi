// The kinds of control an interactive tool has, and how big a tool may be (US-42).

export const CONTROL_TYPES = [
	'slider',
	'number',
	'stepper',
	'toggle',
	'select',
] as const;
export type ControlType = (typeof CONTROL_TYPES)[number];

// the types that move between a lowest and a highest number
export const RANGE_CONTROL_TYPES = ['slider', 'number', 'stepper'] as const;
export type RangeControlType = (typeof RANGE_CONTROL_TYPES)[number];

export const isRangeControl = (type: ControlType): type is RangeControlType =>
	(RANGE_CONTROL_TYPES as readonly string[]).includes(type);

export const INTERACTIVE_CONTROLS_MAX = 6;
export const INTERACTIVE_VALUES_MAX = 6;
export const INTERACTIVE_MARKERS_MAX = 3;
export const SELECT_OPTIONS_MIN = 2;
export const SELECT_OPTIONS_MAX = 6;
// a slider of more steps than this is too fine to drag
export const CONTROL_STEPS_MAX = 1000;
export const VALUE_DECIMALS_MAX = 6;
export const VARIABLE_NAME_MAX_LENGTH = 20;
export const UNIT_MAX_LENGTH = 12;
