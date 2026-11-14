const plain = new Intl.NumberFormat('en', { maximumFractionDigits: 2 });
const compact = new Intl.NumberFormat('en', {
	notation: 'compact',
	maximumFractionDigits: 1,
});

// a number on an axis or in a tooltip: 1,284 in full, 12.9K once it is long
export const formatNumber = (value: number) =>
	Math.abs(value) >= 10_000 ? compact.format(value) : plain.format(value);

// A number with exactly this many decimals. It is rounded first, so a value that
// rounds to 0 shows no minus sign.
export function formatFixed(value: number, decimals: number): string {
	const rounded = Number(value.toFixed(decimals)) + 0;
	return rounded.toLocaleString('en', {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	});
}
