'use client';

import { useState, type ReactNode } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { saveSidebarCollapsed } from '../sidebar-state';
import { DesktopSidebar } from './desktop-sidebar';
import { MobileSidebar } from './mobile-sidebar';
import { TopBar } from './top-bar';

type AppShellProps = {
	// how the student left the desktop sidebar, read from its cookie on the server
	defaultCollapsed: boolean;
	children: ReactNode;
};

export function AppShell({ defaultCollapsed, children }: AppShellProps) {
	const [collapsed, setCollapsed] = useState(defaultCollapsed);
	const [menuOpen, setMenuOpen] = useState(false);

	const toggleSidebar = () => {
		setCollapsed(!collapsed);
		saveSidebarCollapsed(!collapsed);
	};

	return (
		<TooltipProvider delayDuration={150}>
			<div className="flex min-h-svh bg-background">
				<DesktopSidebar collapsed={collapsed} onToggle={toggleSidebar} />
				<MobileSidebar open={menuOpen} onOpenChange={setMenuOpen} />
				<div className="flex min-w-0 flex-1 flex-col bg-card md:m-3 md:rounded-[28px]">
					<TopBar onOpenMenu={() => setMenuOpen(true)} />
					<main className="flex flex-1 flex-col">{children}</main>
				</div>
			</div>
		</TooltipProvider>
	);
}
