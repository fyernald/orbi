'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { SoonBadge } from '@/components/soon-badge';
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
	// not built yet: shown with a Soon label, as text that cannot be clicked
	soon?: boolean;
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
	soon = false,
}: SidebarLinkProps) {
	const content = (
		<>
			<span className="flex size-7 shrink-0 items-center justify-center">
				{icon}
			</span>
			<SidebarLabel hidden={collapsed} className="min-w-0 flex-1 truncate">
				{label}
			</SidebarLabel>
			{soon ? (
				<SidebarLabel hidden={collapsed}>
					<SoonBadge />
				</SidebarLabel>
			) : (
				trailing && <SidebarLabel hidden={collapsed}>{trailing}</SidebarLabel>
			)}
		</>
	);
	const layout = cn(
		'flex h-9 items-center gap-3 overflow-hidden rounded-xl px-2.5 text-sm transition-colors',
		inPanel && 'mx-1 px-1.5 font-medium'
	);

	if (soon) {
		return (
			<SidebarTooltip label={`${label} (coming soon)`} show={collapsed}>
				<span
					aria-disabled="true"
					className={cn(layout, 'cursor-default text-muted-foreground')}
				>
					{content}
				</span>
			</SidebarTooltip>
		);
	}

	return (
		<SidebarTooltip label={label} show={collapsed}>
			<Link
				href={href}
				aria-current={active ? 'page' : undefined}
				className={cn(
					layout,
					inPanel
						? 'text-foreground hover:bg-card/60'
						: 'text-subtle-foreground hover:bg-sidebar-accent hover:text-foreground',
					active &&
						(inPanel
							? 'bg-card hover:bg-card'
							: 'bg-sidebar-accent font-medium text-foreground')
				)}
			>
				{content}
			</Link>
		</SidebarTooltip>
	);
}
