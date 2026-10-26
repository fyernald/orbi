'use client';

import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import Link from 'next/link';
import { OrbiLogo } from '@/components/brand/orbi-logo';
import { OrbiMark } from '@/components/brand/orbi-mark';
import { Button } from '@/components/ui/button';
import { routes } from '@/lib/routes';
import { SidebarTooltip } from './sidebar-tooltip';

type SidebarHeaderProps = {
	collapsed: boolean;
	onToggle: () => void;
	variant: 'rail' | 'drawer';
};

export function SidebarHeader({
	collapsed,
	onToggle,
	variant,
}: SidebarHeaderProps) {
	if (collapsed) {
		return (
			<div className="flex h-12 items-center">
				<SidebarTooltip label="Expand sidebar" show>
					<button
						type="button"
						onClick={onToggle}
						aria-label="Expand sidebar"
						className="group flex size-12 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
					>
						<OrbiMark className="group-hover:hidden group-focus-visible:hidden" />
						<PanelLeftOpen className="hidden size-5 group-hover:block group-focus-visible:block" />
					</button>
				</SidebarTooltip>
			</div>
		);
	}

	const isDrawer = variant === 'drawer';
	const ToggleIcon = isDrawer ? X : PanelLeftClose;

	return (
		<div className="flex h-12 items-center justify-between pl-2.5">
			<Link href={routes.app} aria-label="Orbi home" className="rounded-lg">
				<OrbiLogo />
			</Link>
			<Button
				variant="ghost"
				size="icon-lg"
				onClick={onToggle}
				aria-label={isDrawer ? 'Close menu' : 'Collapse sidebar'}
				className="rounded-xl text-muted-foreground hover:bg-sidebar-accent"
			>
				<ToggleIcon className="size-5" />
			</Button>
		</div>
	);
}
