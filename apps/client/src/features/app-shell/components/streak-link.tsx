import { FlameIcon } from 'lucide-react';
import Link from 'next/link';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { routes } from '@/lib/routes';

export function StreakLink({ days }: { days: number }) {
	const label = `${days}-day streak`;

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Link
					href={routes.progress}
					aria-label={`${label}, see your progress`}
					className="flex h-9 items-center gap-1.5 rounded-full bg-tone-amber px-3 text-sm font-medium text-tone-amber-foreground tabular-nums transition-colors hover:bg-tone-amber/70 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
				>
					<FlameIcon className="size-4" />
					{days}
				</Link>
			</TooltipTrigger>
			<TooltipContent sideOffset={6}>{label}</TooltipContent>
		</Tooltip>
	);
}
