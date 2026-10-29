'use client';

import { BookOpen, ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';
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
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import type { Topic } from '../mock-data';
import { MenuScrollArea, menuItemHeight } from './menu-scroll-area';
import { PickerButton } from './picker-button';

type TopicPickerProps = {
	topics: Topic[];
	selected: Topic | undefined;
	onSelect: (topicId: string) => void;
};

export function TopicPicker({ topics, selected, onSelect }: TopicPickerProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<PickerButton icon={BookOpen} tone="bg-accent text-accent-foreground">
					{selected ? (
						<>
							<span className="truncate">{selected.course}</span>
							<ChevronRight className="size-3 shrink-0 text-muted-foreground" />
							<span className="truncate">{selected.name}</span>
						</>
					) : (
						<span>Choose a topic</span>
					)}
				</PickerButton>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				sideOffset={6}
				className="w-72 rounded-xl p-1.5 shadow-sm"
			>
				{topics.length > 0 && (
					<>
						<DropdownMenuLabel className="px-2 py-1.5 text-[13px] font-normal text-muted-foreground">
							Recent topics
						</DropdownMenuLabel>
						<MenuScrollArea>
							<DropdownMenuRadioGroup
								value={selected?.id}
								onValueChange={onSelect}
							>
								{topics.map((topic) => (
									<DropdownMenuRadioItem
										key={topic.id}
										value={topic.id}
										className={cn(menuItemHeight, 'rounded-lg px-2')}
									>
										<span className="flex min-w-0 flex-col">
											<span className="truncate font-medium">{topic.name}</span>
											<span className="truncate text-[13px] text-muted-foreground">
												{topic.course}
											</span>
										</span>
									</DropdownMenuRadioItem>
								))}
							</DropdownMenuRadioGroup>
						</MenuScrollArea>
						<DropdownMenuSeparator />
					</>
				)}
				<DropdownMenuItem asChild className="h-9 gap-2.5 rounded-lg px-2">
					<Link href={routes.courses}>
						<Plus />
						Add a course or topic
					</Link>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
