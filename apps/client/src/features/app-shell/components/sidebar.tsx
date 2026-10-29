import { courses, mainNav, miniApps } from '../mock-data';
import { AccountMenu } from './account-menu';
import { AddNotesButton } from './add-notes-button';
import { CoursesSection } from './courses-section';
import { MainNav } from './main-nav';
import { MiniAppsSection } from './mini-apps-section';
import { SidebarHeader } from './sidebar-header';

type SidebarProps = {
	collapsed: boolean;
	onToggle: () => void;
	variant: 'rail' | 'drawer';
};

export function Sidebar({ collapsed, onToggle, variant }: SidebarProps) {
	return (
		<nav
			aria-label="Main"
			className="flex h-full flex-col gap-5 overflow-x-hidden overflow-y-auto px-3 pt-3 pb-3"
		>
			<SidebarHeader
				collapsed={collapsed}
				onToggle={onToggle}
				variant={variant}
			/>
			<div className="-mt-2">
				<AddNotesButton collapsed={collapsed} />
			</div>
			<MainNav links={mainNav} collapsed={collapsed} />
			<MiniAppsSection apps={miniApps} collapsed={collapsed} />
			<CoursesSection courses={courses} collapsed={collapsed} />
			<AccountMenu collapsed={collapsed} />
		</nav>
	);
}
