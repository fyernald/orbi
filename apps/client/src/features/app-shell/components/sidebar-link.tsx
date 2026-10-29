'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { SidebarLabel } from './sidebar-label';
import { SidebarTooltip } from './sidebar-tooltip';

type SidebarLinkProps = {
	href: string;
	label: string;
	icon: ReactNode;
	collapsed: boolean;
	active?: boolean;
	trailing?: ReactNode;
	inPanel?: boolean;
};

// the icon stays in the same place in both widths, so only the text moves
export function SidebarLink({
	href,
	label,
	icon,
	collapsed,
	active = false,
	trailing,
	inPanel = false,
}: SidebarLinkProps) {
	return (
		<SidebarTooltip label={label} show={collapsed}>
			<Link
				href={href}
				aria-current={active ? 'page' : undefined}
				className={cn(
					'flex h-9 items-center gap-3 overflow-hidden rounded-xl px-2.5 text-sm transition-colors',
					inPanel
						? 'mx-1 px-1.5 font-medium text-foreground hover:bg-card/60'
						: 'text-subtle-foreground hover:bg-sidebar-accent hover:text-foreground',
					active &&
						(inPanel
							? 'bg-card hover:bg-card'
							: 'bg-sidebar-accent font-medium text-foreground')
				)}
			>
				<span className="flex size-7 shrink-0 items-center justify-center">
					{icon}
				</span>
				<SidebarLabel hidden={collapsed} className="min-w-0 flex-1 truncate">
					{label}
				</SidebarLabel>
				{trailing && <SidebarLabel hidden={collapsed}>{trailing}</SidebarLabel>}
			</Link>
		</SidebarTooltip>
	);
}
