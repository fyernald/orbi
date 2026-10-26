import { cn } from '@/lib/utils';
import type { MiniApp } from '../mock-data';
import { toneClasses } from '../tones';

export function MiniAppIcon({ app }: { app: MiniApp }) {
	const Icon = app.icon;
	return (
		<span
			className={cn(
				'flex size-7 items-center justify-center rounded-[9px]',
				toneClasses[app.tone]
			)}
		>
			<Icon className="size-4" />
		</span>
	);
}
