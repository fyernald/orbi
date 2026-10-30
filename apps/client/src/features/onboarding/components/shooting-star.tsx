// where the streak starts, as a share of the screen, and its angle; picked by the question number
// so each question has its own star and it is the same after a refresh
const paths = [
	{ left: 14, top: 18, angle: 24 },
	{ left: 58, top: 8, angle: 32 },
	{ left: 30, top: 34, angle: 18 },
	{ left: 70, top: 22, angle: 28 },
	{ left: 8, top: 46, angle: 14 },
	{ left: 46, top: 14, angle: 36 },
];

// one streak across the sky; a new key plays it again
export function ShootingStar({ seed }: { seed: number }) {
	const { left, top, angle } = paths[seed % paths.length]!;

	return (
		<div
			className="absolute"
			style={{ left: `${left}%`, top: `${top}%`, rotate: `${angle}deg` }}
		>
			<div className="shooting-star relative" />
		</div>
	);
}
