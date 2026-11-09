const plain = new Intl.NumberFormat('en', { maximumFractionDigits: 2 });
const compact = new Intl.NumberFormat('en', {
	notation: 'compact',
	maximumFractionDigits: 1,
});

// a number on an axis or in a tooltip: 1,284 in full, 12.9K once it is long
export const formatNumber = (value: number) =>
	Math.abs(value) >= 10_000 ? compact.format(value) : plain.format(value);
