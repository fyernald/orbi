import type { ComponentType, SVGProps } from 'react';
import type { MascotPose } from '../poses';
import { IdleCat } from './idle-cat';

// one drawing per pose; the paid art replaces the files, not this list
export const mascotArt: Record<
	MascotPose,
	ComponentType<SVGProps<SVGSVGElement>>
> = {
	idle: IdleCat,
};
