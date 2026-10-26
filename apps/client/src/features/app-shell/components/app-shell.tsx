'use client';

import { useState, type ReactNode } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { DesktopSidebar } from './desktop-sidebar';
import { MobileSidebar } from './mobile-sidebar';
import { TopBar } from './top-bar';

export function AppShell({ children }: { children: ReactNode }) {
	const [collapsed, setCollapsed] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<TooltipProvider delayDuration={150}>
			<div className="flex min-h-svh bg-background">
				<DesktopSidebar
					collapsed={collapsed}
					onToggle={() => setCollapsed((value) => !value)}
				/>
				<MobileSidebar open={menuOpen} onOpenChange={setMenuOpen} />
				<div className="flex min-w-0 flex-1 flex-col bg-card md:my-3 md:mr-3 md:rounded-[28px]">
					<TopBar onOpenMenu={() => setMenuOpen(true)} />
					<main className="flex flex-1 flex-col">{children}</main>
				</div>
			</div>
		</TooltipProvider>
	);
}
