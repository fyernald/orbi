// where the moon sits on a ring for a share from 0 to 100,
// starting at the top and going clockwise
export function orbitPoint(
	percent: number,
	radius: number,
	center: number
): { x: number; y: number } {
	const angle = (percent / 100) * 2 * Math.PI - Math.PI / 2;
	return {
		x: center + radius * Math.cos(angle),
		y: center + radius * Math.sin(angle),
	};
}
