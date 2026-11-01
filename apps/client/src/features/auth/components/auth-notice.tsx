import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type AuthNoticeProps = {
	icon: LucideIcon;
	title: string;
	children: ReactNode;
	action?: ReactNode;
};

// a short message in place of a form, for example "Check your email"
export function AuthNotice({
	icon: Icon,
	title,
	children,
	action,
}: AuthNoticeProps) {
	return (
		<div role="status" className="flex flex-col items-start gap-4">
			<span className="pop-in flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
				<Icon className="size-6" />
			</span>
			<div className="flex flex-col gap-1.5">
				<h2 className="text-lg font-semibold">{title}</h2>
				<div className="text-pretty text-muted-foreground">{children}</div>
			</div>
			{action}
		</div>
	);
}
