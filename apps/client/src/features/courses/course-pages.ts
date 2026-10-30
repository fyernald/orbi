// the items in pages of `size`, for a grid that scrolls sideways one page at a time
export function toPages<T>(items: T[], size: number): T[][] {
	const pages: T[][] = [];
	for (let start = 0; start < items.length; start += size) {
		pages.push(items.slice(start, start + size));
	}
	return pages;
}

// the page whose start is closest to the scroll position
export function nearestPage(pageStarts: number[], scrollLeft: number): number {
	let nearest = 0;
	pageStarts.forEach((start, index) => {
		if (
			Math.abs(start - scrollLeft) < Math.abs(pageStarts[nearest]! - scrollLeft)
		) {
			nearest = index;
		}
	});
	return nearest;
}
