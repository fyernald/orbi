import { cn } from '@/lib/utils';
import type { MiniApp } from '../mock-data';
import { toneClasses } from '../tones';

type MiniAppIconProps = {
	app: MiniApp;
	showLiveDot: boolean;
};

export function MiniAppIcon({ app, showLiveDot }: MiniAppIconProps) {
	const Icon = app.icon;
	return (
		<span
			className={cn(
				'relative flex size-7 items-center justify-center rounded-[9px]',
				toneClasses[app.tone]
			)}
		>
			<Icon className="size-4" />
			{app.liveCount ? (
				<span
					aria-hidden="true"
					className={cn(
						'absolute -top-1 -right-1 size-2.5 rounded-full border-2 border-accent bg-[#2bd4a4] transition-opacity duration-200',
						showLiveDot ? 'opacity-100' : 'opacity-0'
					)}
				/>
			) : null}
		</span>
	);
}
