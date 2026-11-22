import type { SVGProps } from 'react';
import { CatFrame, OpenEyes, SmileMouth } from './cat-parts';

// hello: one paw up, waving (mascot-wave in globals.css)
export function WaveCat(props: SVGProps<SVGSVGElement>) {
	return (
		<CatFrame {...props}>
			<OpenEyes />
			<SmileMouth />
			<g
				className="mascot-wave fill-mascot-fur stroke-mascot-line"
				strokeWidth="1"
			>
				<path d="M30 40 L31.5 30" strokeWidth="3.2" strokeLinecap="round" />
				<path
					d="M30 40 L31.5 30"
					className="stroke-mascot-fur"
					strokeWidth="1.6"
				/>
				<circle cx="31.8" cy="28.6" r="2.6" />
				<path
					d="M30.6 27 V28.2 M31.8 26.6 V28 M33 27 V28.2"
					strokeWidth="0.6"
					strokeLinecap="round"
					fill="none"
				/>
			</g>
		</CatFrame>
	);
}
