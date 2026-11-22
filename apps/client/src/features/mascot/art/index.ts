import { lazy, type ComponentType, type SVGProps } from 'react';
import type { MascotPose } from '../poses';
import { IdleCat } from './idle-cat';

type PoseArt = ComponentType<SVGProps<SVGSVGElement>>;

// The resting cat comes with the page; every other pose is its own small file,
// loaded the first time the cat needs it. The paid art replaces these files,
// not this list.
export const mascotArt: Record<MascotPose, PoseArt> = {
	idle: IdleCat,
	wave: lazy(() => import('./wave-cat').then((m) => ({ default: m.WaveCat }))),
	think: lazy(() =>
		import('./think-cat').then((m) => ({ default: m.ThinkCat }))
	),
	cheer: lazy(() =>
		import('./cheer-cat').then((m) => ({ default: m.CheerCat }))
	),
	sleepy: lazy(() =>
		import('./sleepy-cat').then((m) => ({ default: m.SleepyCat }))
	),
};
