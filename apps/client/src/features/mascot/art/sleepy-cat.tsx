import type { SVGProps } from 'react';
import { CatFrame, ClosedEyes, FlatMouth } from './cat-parts';

// an empty page: eyes shut and a couple of z's drifting up (mascot-zs in
// globals.css)
export function SleepyCat(props: SVGProps<SVGSVGElement>) {
	return (
		<CatFrame {...props}>
			<ClosedEyes />
			<FlatMouth />
			<g className="mascot-zs fill-mascot-star text-[5px] font-bold">
				<text x="18" y="8">
					z
				</text>
				<text x="21.5" y="5" className="text-[3.6px]">
					z
				</text>
			</g>
		</CatFrame>
	);
}
