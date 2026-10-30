export type ScrollEdges = {
	// there is more to scroll to above or below what shows
	above: boolean;
	below: boolean;
};

type ScrollMeasure = {
	scrollTop: number;
	clientHeight: number;
	scrollHeight: number;
};

// browsers can stop a pixel short of the end when zoomed, so 1px counts as the end
export function scrollEdges({
	scrollTop,
	clientHeight,
	scrollHeight,
}: ScrollMeasure): ScrollEdges {
	return {
		above: scrollTop > 1,
		below: scrollTop + clientHeight < scrollHeight - 1,
	};
}
