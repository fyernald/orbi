import { isRangeControl, type InteractiveControl } from '@orbi/shared';
import { niceStep } from './nice-scale';
import { formatFixed } from './number-format';

// How an interactive tool's controls move and read (US-42).

// a slider left without a step moves in about 100 round steps
const DEFAULT_STEPS = 100;

export function controlStep(control: InteractiveControl): number {
	if (control.step !== undefined) return control.step;
	if (!isRangeControl(control.type)) return 1;
	const { min = 0, max = 1 } = control;
	return niceStep((max - min) / DEFAULT_STEPS);
}

// how many decimals a step needs: 0.25 needs 2, 5 needs none
export function stepDecimals(step: number): number {
	const [, decimals = ''] = String(step).split('.');
	return Math.min(decimals.length, 6);
}

// A typed or stepped value kept inside the control's range, on its steps
// counted from min. A value that is not a number keeps the old one.
export function fitToControl(
	control: InteractiveControl,
	wanted: number,
	current: number
): number {
	if (!Number.isFinite(wanted)) return current;
	const { min = -Infinity, max = Infinity } = control;
	const step = controlStep(control);
	const base = Number.isFinite(min) ? min : 0;
	const stepped = base + Math.round((wanted - base) / step) * step;
	const kept = Math.min(max, Math.max(min, stepped));
	// + 0 turns -0 into 0
	return Number(kept.toFixed(stepDecimals(step))) + 0;
}

// a control's value as it reads beside its label
export function formatControlValue(
	control: InteractiveControl,
	value: number
): string {
	if (control.type === 'toggle') return value ? 'On' : 'Off';
	if (control.type === 'select') {
		return (
			control.options?.find((option) => option.value === value)?.label ?? ''
		);
	}
	return formatFixed(value, stepDecimals(controlStep(control)));
}
