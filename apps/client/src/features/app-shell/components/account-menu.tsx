'use client';

import { ChevronsUpDown, LogOut, Settings2 } from 'lucide-react';
import Link from 'next/link';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSession, useSignOut } from '@/features/auth/hooks';
import { routes } from '@/lib/routes';
import { SidebarLabel } from './sidebar-label';
import { SidebarTooltip } from './sidebar-tooltip';
import { UserAvatar } from './user-avatar';

export function AccountMenu({ collapsed }: { collapsed: boolean }) {
	const { data: session } = useSession();
	const signOut = useSignOut();
	if (!session) return null;

	const { name, email } = session.user;

	return (
		<div className="mt-auto border-t border-sidebar-border pt-3">
			<DropdownMenu>
				<SidebarTooltip label={name} show={collapsed}>
					<DropdownMenuTrigger asChild>
						<button
							type="button"
							aria-label={`Account: ${name}`}
							className="flex h-12 w-full items-center gap-3 overflow-hidden rounded-xl px-1.5 text-left transition-colors outline-none hover:bg-sidebar-accent focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=open]:bg-sidebar-accent"
						>
							<UserAvatar name={name} />
							<SidebarLabel
								hidden={collapsed}
								className="flex min-w-0 flex-1 flex-col gap-0.5"
							>
								<span className="truncate text-sm font-medium">{name}</span>
								<span className="truncate text-[13px] text-muted-foreground">
									{email}
								</span>
							</SidebarLabel>
							<SidebarLabel hidden={collapsed}>
								<ChevronsUpDown className="size-4 text-muted-foreground" />
							</SidebarLabel>
						</button>
					</DropdownMenuTrigger>
				</SidebarTooltip>
				<DropdownMenuContent
					side={collapsed ? 'right' : 'top'}
					align={collapsed ? 'end' : 'start'}
					sideOffset={8}
					className="w-60 rounded-xl p-1.5 shadow-sm"
				>
					<DropdownMenuLabel className="flex flex-col gap-0.5 px-2 py-1.5">
						<span className="truncate text-sm font-medium text-foreground">
							{name}
						</span>
						<span className="truncate text-[13px] font-normal text-muted-foreground">
							{email}
						</span>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem asChild className="h-9 gap-2.5 rounded-lg">
						<Link href={routes.settings}>
							<Settings2 />
							Settings
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem
						className="h-9 gap-2.5 rounded-lg"
						disabled={signOut.isPending}
						onSelect={() => signOut.mutate()}
					>
						<LogOut />
						Log out
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
