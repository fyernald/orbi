'use client';

import type { TutorAction } from '@orbi/shared';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ComposerAction } from '../actions';
import { BetaBadge } from './beta-badge';
import { PickerButton } from './picker-button';

type ActionPickerProps = {
	actions: ComposerAction[];
	selected: ComposerAction;
	onSelect: (action: TutorAction) => void;
};

export function ActionPicker({
	actions,
	selected,
	onSelect,
}: ActionPickerProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<PickerButton
					icon={selected.icon}
					tone="bg-primary text-primary-foreground"
				>
					<span className="truncate">{selected.label}</span>
				</PickerButton>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				sideOffset={6}
				className="w-72 rounded-xl p-1.5 shadow-sm"
			>
				<DropdownMenuLabel className="px-2 py-1.5 text-[13px] font-normal text-muted-foreground">
					What should Orbi do?
				</DropdownMenuLabel>
				<DropdownMenuRadioGroup
					value={selected.id}
					// the values are the ids of the actions listed below
					onValueChange={(id) => onSelect(id as TutorAction)}
				>
					{actions.map((action) => (
						<DropdownMenuRadioItem
							key={action.id}
							value={action.id}
							className="items-start gap-2.5 rounded-lg px-2 py-2"
						>
							<action.icon className="mt-0.5 text-muted-foreground" />
							<span className="flex min-w-0 flex-col gap-0.5">
								<span className="flex items-center gap-1.5 font-medium">
									{action.label}
									{action.beta && <BetaBadge />}
								</span>
								<span className="text-[13px] text-muted-foreground">
									{action.description}
								</span>
							</span>
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
