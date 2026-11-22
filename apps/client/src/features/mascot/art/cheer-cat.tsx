import type { SVGProps } from 'react';
import { CatFrame, HappyEyes, OpenMouth } from './cat-parts';

// a right answer: happy eyes, a hop, and sparkles (mascot-hop and
// mascot-sparkles in globals.css)
export function CheerCat(props: SVGProps<SVGSVGElement>) {
	return (
		<CatFrame {...props} bodyClassName="mascot-hop">
			<HappyEyes />
			<OpenMouth />
			<g className="mascot-sparkles fill-mascot-star">
				<Sparkle x={6} y={15} size={2.2} />
				<Sparkle x={34} y={12} size={1.8} />
				<Sparkle x={20} y={4.5} size={1.6} />
			</g>
		</CatFrame>
	);
}

// a four-pointed star
function Sparkle({ x, y, size }: { x: number; y: number; size: number }) {
	const s = size;
	const w = size / 3.5;
	return (
		<path
			d={`M${x} ${y - s} L${x + w} ${y - w} L${x + s} ${y} L${x + w} ${y + w} L${x} ${y + s} L${x - w} ${y + w} L${x - s} ${y} L${x - w} ${y - w} Z`}
		/>
	);
}
