import { Plus } from 'lucide-react';
import Link from 'next/link';
import { routes } from '@/lib/routes';
import { SidebarLabel } from './sidebar-label';
import { SidebarTooltip } from './sidebar-tooltip';

export function AddNotesButton({ collapsed }: { collapsed: boolean }) {
	return (
		<SidebarTooltip label="Add notes" show={collapsed}>
			<Link
				href={routes.courses}
				className="flex h-12 items-center gap-2.5 overflow-hidden rounded-2xl bg-primary pr-3 pl-[15px] text-[15px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
			>
				<Plus className="size-[18px] shrink-0" strokeWidth={2.25} />
				<SidebarLabel hidden={collapsed}>Add notes</SidebarLabel>
			</Link>
		</SidebarTooltip>
	);
}
