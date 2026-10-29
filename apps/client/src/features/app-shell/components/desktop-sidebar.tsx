import { cn } from '@/lib/utils';
import { Sidebar } from './sidebar';

type DesktopSidebarProps = {
	collapsed: boolean;
	onToggle: () => void;
};

export function DesktopSidebar({ collapsed, onToggle }: DesktopSidebarProps) {
	return (
		<aside
			className={cn(
				'sticky top-0 hidden h-svh shrink-0 bg-sidebar transition-[width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none md:block',
				collapsed ? 'w-18' : 'w-60'
			)}
		>
			<Sidebar collapsed={collapsed} onToggle={onToggle} variant="rail" />
		</aside>
	);
}
