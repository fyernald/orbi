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
		<div role="status" className="flex flex-col items-center gap-3 text-center">
			<Icon className="size-8 text-muted-foreground" aria-hidden />
			<h2 className="font-medium">{title}</h2>
			<div className="text-sm text-muted-foreground">{children}</div>
			{action}
		</div>
	);
}
