import type { SVGProps } from 'react';
import { CatFrame, FlatMouth, OpenEyes } from './cat-parts';

// while Orbi writes a reply: eyes up, and dots like a thought taking shape
// (mascot-dots in globals.css)
export function ThinkCat(props: SVGProps<SVGSVGElement>) {
	return (
		<CatFrame {...props}>
			<OpenEyes lookUp />
			<FlatMouth />
			<g className="mascot-dots fill-mascot-star">
				<circle cx="16.4" cy="5.4" r="1" />
				<circle cx="20" cy="4.4" r="1.2" />
				<circle cx="23.8" cy="5.4" r="1" />
			</g>
		</CatFrame>
	);
}
