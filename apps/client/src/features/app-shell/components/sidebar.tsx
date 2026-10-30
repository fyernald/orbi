import { useCourses } from '@/features/courses/hooks';
import { cn } from '@/lib/utils';
import { mainNav, miniApps } from '../mock-data';
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

// the logo and Add notes stay at the top and the account at the bottom;
// only the course list scrolls, and on very short screens the whole middle part
export function Sidebar({ collapsed, onToggle, variant }: SidebarProps) {
	const courses = useCourses();

	return (
		<nav
			aria-label="Main"
			className="flex h-full flex-col overflow-x-hidden px-3 py-3"
		>
			<div className="flex shrink-0 flex-col gap-3">
				<SidebarHeader
					collapsed={collapsed}
					onToggle={onToggle}
					variant={variant}
				/>
				<AddNotesButton collapsed={collapsed} />
			</div>
			{/* the side padding gives focus outlines room inside the scroll area;
			    the collapsed rail is too narrow for a scrollbar, so it hides it */}
			<div
				className={cn(
					'-mx-1 flex min-h-0 flex-1 flex-col gap-5 overflow-x-hidden overflow-y-auto px-1 py-5',
					collapsed && 'scrollbar-none'
				)}
			>
				<MainNav links={mainNav} collapsed={collapsed} />
				<MiniAppsSection apps={miniApps} collapsed={collapsed} />
				<CoursesSection courses={courses.data} collapsed={collapsed} />
			</div>
			<AccountMenu collapsed={collapsed} />
		</nav>
	);
}
