import type { SVGProps } from 'react';
import { CatFrame, OpenEyes, SmileMouth } from './cat-parts';

// resting; the pose the cat is in most of the time
export function IdleCat(props: SVGProps<SVGSVGElement>) {
	return (
		<CatFrame {...props}>
			<OpenEyes />
			<SmileMouth />
		</CatFrame>
	);
}
