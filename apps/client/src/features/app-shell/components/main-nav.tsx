'use client';

import { usePathname } from 'next/navigation';
import { routes } from '@/lib/routes';
import type { NavLink } from '../mock-data';
import { SidebarLink } from './sidebar-link';

type MainNavProps = {
	links: NavLink[];
	collapsed: boolean;
};

const isActive = (href: string, pathname: string) =>
	href === routes.app ? pathname === href : pathname.startsWith(href);

export function MainNav({ links, collapsed }: MainNavProps) {
	const pathname = usePathname();

	return (
		<div className="flex flex-col gap-0.5">
			{links.map(({ href, label, icon: Icon }) => (
				<SidebarLink
					key={href}
					href={href}
					label={label}
					icon={<Icon className="size-5" />}
					active={isActive(href, pathname)}
					collapsed={collapsed}
				/>
			))}
		</div>
	);
}
