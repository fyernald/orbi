'use client';

import { usePathname } from 'next/navigation';
import type { MiniApp } from '../mock-data';
import { LiveCount } from './live-count';
import { MiniAppIcon } from './mini-app-icon';
import { SidebarLink } from './sidebar-link';
import { SidebarSectionTitle } from './sidebar-section-title';

type MiniAppsSectionProps = {
	apps: MiniApp[];
	collapsed: boolean;
};

export function MiniAppsSection({ apps, collapsed }: MiniAppsSectionProps) {
	const pathname = usePathname();

	return (
		<section
			aria-labelledby="sidebar-mini-apps"
			className="flex flex-col gap-0.5 rounded-2xl bg-accent py-1"
		>
			<SidebarSectionTitle
				id="sidebar-mini-apps"
				collapsed={collapsed}
				className="text-accent-foreground"
			>
				Mini apps
			</SidebarSectionTitle>
			{apps.map((app) => (
				<SidebarLink
					key={app.href}
					href={app.href}
					label={app.label}
					icon={<MiniAppIcon app={app} showLiveDot={collapsed} />}
					trailing={
						app.liveCount ? <LiveCount count={app.liveCount} /> : undefined
					}
					active={pathname.startsWith(app.href)}
					collapsed={collapsed}
					inPanel
				/>
			))}
		</section>
	);
}
