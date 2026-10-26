import { APP_NAME } from '@orbi/shared';
import { cn } from '@/lib/utils';
import { OrbiMark } from './orbi-mark';

export function OrbiLogo({ className }: { className?: string }) {
	return (
		<span className={cn('flex items-center gap-2.5', className)}>
			<OrbiMark />
			<span className="text-lg font-semibold tracking-tight">{APP_NAME}</span>
		</span>
	);
}
