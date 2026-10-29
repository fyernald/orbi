import { FlameIcon } from 'lucide-react';
import Link from 'next/link';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { streakLabel, streakLevel, type StreakLevel } from '../streak';

const pillStyle: Record<StreakLevel, string> = {
	none: 'border-border bg-muted text-muted-foreground hover:bg-secondary',
	warm: 'border-transparent bg-tone-amber text-tone-amber-foreground hover:bg-tone-amber/70',
	hot: 'border-tone-red-foreground/30 bg-tone-red text-tone-red-foreground hover:bg-tone-red/70',
	// the border and glow come from .streak-blazing in globals.css
	blazing: 'streak-blazing text-tone-red-foreground hover:brightness-95',
};

// the longer the streak, the hotter it looks
export function StreakLink({ days }: { days: number }) {
	const level = streakLevel(days);
	const label = streakLabel(days);

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Link
					href={routes.progress}
					aria-label={`${label} (see your progress)`}
					className={cn(
						'flex h-9 items-center gap-1.5 rounded-full border-[1.5px] px-3 text-sm font-medium tabular-nums transition-[background-color,filter] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
						pillStyle[level]
					)}
				>
					<FlameIcon
						className={cn(
							'size-4',
							level === 'blazing' && 'streak-flicker fill-current/25'
						)}
					/>
					{days}
				</Link>
			</TooltipTrigger>
			<TooltipContent sideOffset={6}>{label}</TooltipContent>
		</Tooltip>
	);
}
