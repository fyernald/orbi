'use client';

import type { ChatSummary } from '@orbi/shared';
import { History, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	MenuScrollArea,
	menuItemHeight,
} from '@/features/tutor/components/menu-scroll-area';
import { formatTimeAgo } from '@/lib/dates';
import { cn } from '@/lib/utils';

type ChatHistoryMenuProps = {
	// the open topic's saved chats, or the whole course's, newest first
	chats: ChatSummary[];
	currentId: string;
	// the topic's name, or "Whole course"
	scopeName: string;
	onOpen: (chatId: string) => void;
	// the open chat can be renamed or deleted once it is saved
	canEditCurrent: boolean;
	// a chat with a reply still running cannot be deleted
	canDeleteCurrent: boolean;
	onRename: () => void;
	onDelete: () => void;
};

// the earlier chats of the open topic; picking one opens it, and the open one is ticked.
// Below them, the open chat can be renamed or deleted
export function ChatHistoryMenu({
	chats,
	currentId,
	scopeName,
	onOpen,
	canEditCurrent,
	canDeleteCurrent,
	onRename,
	onDelete,
}: ChatHistoryMenuProps) {
	const now = new Date();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					aria-label="Chats"
					className="rounded-md text-muted-foreground"
				>
					<History />
					<span className="hidden sm:inline">Chats</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				sideOffset={6}
				className="w-72 max-w-[calc(100vw-2rem)] rounded-xl p-1.5 shadow-sm"
			>
				<DropdownMenuLabel className="truncate px-2 py-1.5 text-[13px] font-normal text-muted-foreground">
					Chats in {scopeName}
				</DropdownMenuLabel>
				<MenuScrollArea>
					<DropdownMenuRadioGroup value={currentId} onValueChange={onOpen}>
						{chats.map((chat) => (
							<DropdownMenuRadioItem
								key={chat.id}
								value={chat.id}
								className={cn(menuItemHeight, 'rounded-lg px-2')}
							>
								<span className="flex min-w-0 flex-col">
									<span className="truncate font-medium">{chat.title}</span>
									<span className="text-[13px] text-muted-foreground">
										{formatTimeAgo(chat.updatedAt, now)}
									</span>
								</span>
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>
				</MenuScrollArea>
				{canEditCurrent && (
					<>
						<DropdownMenuSeparator />
						<DropdownMenuItem onSelect={onRename} className="rounded-lg px-2">
							<Pencil />
							Rename this chat
						</DropdownMenuItem>
						<DropdownMenuItem
							variant="destructive"
							disabled={!canDeleteCurrent}
							onSelect={onDelete}
							className="rounded-lg px-2"
						>
							<Trash2 />
							{canDeleteCurrent
								? 'Delete this chat'
								: 'Delete this chat (Orbi is replying)'}
						</DropdownMenuItem>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
