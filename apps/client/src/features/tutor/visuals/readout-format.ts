import { formatFixed, formatNumber } from './number-format';

// a unit that sits right against its number
const CLOSE_UNITS = new Set(['%', '°']);

// A worked-out value as the student reads it: with the decimals the AI asked
// for, then its unit. One that is not a number (a division by 0) shows a dash.
export function formatReadout(
	value: number | undefined,
	decimals?: number,
	unit?: string
): string {
	if (value === undefined || !Number.isFinite(value)) return '—';
	const number =
		decimals === undefined ? formatNumber(value) : formatFixed(value, decimals);
	if (!unit) return number;
	return CLOSE_UNITS.has(unit) ? `${number}${unit}` : `${number} ${unit}`;
}
