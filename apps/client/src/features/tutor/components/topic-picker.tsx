'use client';

import { BookOpen, ChevronRight, Layers, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';
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
	// '' picks the whole course
	onSelect: (topicId: string) => void;
	// the course's name, to offer the whole course as a choice
	wholeCourse?: string;
};

// a radio value cannot be empty, so the whole course has its own
const WHOLE_COURSE = 'whole-course';

export function TopicPicker({
	topics,
	selected,
	onSelect,
	wholeCourse,
}: TopicPickerProps) {
	// Picking a topic can open another chat, which hides this one and the button the
	// menu hangs from. The menu would then jump to the page's corner while it closes,
	// so the choice is passed on only once the menu is gone.
	const picked = useRef<string | null>(null);

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
					) : wholeCourse ? (
						<>
							<span className="truncate">{wholeCourse}</span>
							<ChevronRight className="size-3 shrink-0 text-muted-foreground" />
							<span className="truncate">Whole course</span>
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
				onCloseAutoFocus={() => {
					const topicId = picked.current;
					if (topicId === null) return;
					picked.current = null;
					onSelect(topicId);
				}}
			>
				{topics.length > 0 && (
					<>
						<DropdownMenuLabel className="px-2 py-1.5 text-[13px] font-normal text-muted-foreground">
							Recent topics
						</DropdownMenuLabel>
						<MenuScrollArea>
							<DropdownMenuRadioGroup
								value={selected?.id ?? (wholeCourse ? WHOLE_COURSE : undefined)}
								onValueChange={(value) => {
									picked.current = value === WHOLE_COURSE ? '' : value;
								}}
							>
								{wholeCourse && (
									<DropdownMenuRadioItem
										value={WHOLE_COURSE}
										className={cn(menuItemHeight, 'gap-2 rounded-lg px-2')}
									>
										<Layers className="text-muted-foreground" />
										<span className="flex min-w-0 flex-col">
											<span className="truncate font-medium">Whole course</span>
											<span className="truncate text-[13px] text-muted-foreground">
												{wholeCourse}
											</span>
										</span>
									</DropdownMenuRadioItem>
								)}
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
