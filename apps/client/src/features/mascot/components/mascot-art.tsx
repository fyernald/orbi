'use client';

import { Suspense } from 'react';
import { cn } from '@/lib/utils';
import { mascotArt } from '../art';
import { IdleCat } from '../art/idle-cat';
import type { MascotPose } from '../poses';

type MascotArtProps = {
	pose: MascotPose;
	className?: string;
};

// A picture only; the button around it says what it does. A pose that is
// still loading shows the resting cat meanwhile.
export function MascotArt({ pose, className }: MascotArtProps) {
	const Art = mascotArt[pose];
	const classes = cn('size-9 shrink-0', className);

	return (
		<Suspense fallback={<IdleCat className={classes} />}>
			<Art className={classes} data-pose={pose} />
		</Suspense>
	);
}
