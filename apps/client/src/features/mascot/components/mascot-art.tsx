import { cn } from '@/lib/utils';
import { mascotArt } from '../art';
import type { MascotPose } from '../poses';

type MascotArtProps = {
	pose: MascotPose;
	className?: string;
};

// a picture only; the button around it says what it does
export function MascotArt({ pose, className }: MascotArtProps) {
	const Art = mascotArt[pose];
	return <Art className={cn('size-9 shrink-0', className)} />;
}
