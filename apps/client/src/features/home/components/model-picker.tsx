'use client';

import { ChevronDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { AiModel } from '../mock-data';
import { MenuScrollArea, menuItemHeight } from './menu-scroll-area';
import { ModelLogo } from './model-logo';

type ModelPickerProps = {
	models: AiModel[];
	selectedId: string;
	onSelect: (modelId: string) => void;
};

export function ModelPicker({
	models,
	selectedId,
	onSelect,
}: ModelPickerProps) {
	const selected = models.find(({ id }) => id === selectedId);
	const label = selected?.label ?? 'Choose a model';

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					aria-label={`Model: ${label}`}
					className="h-9 gap-1.5 rounded-full px-2.5 text-[13px] text-subtle-foreground"
				>
					{selected ? (
						<ModelLogo family={selected.family} />
					) : (
						<Sparkles className="size-4" />
					)}
					<span className="hidden sm:inline">{label}</span>
					<ChevronDown className="size-3.5 text-muted-foreground" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				sideOffset={6}
				className="w-68 rounded-xl p-1.5 shadow-sm"
			>
				<DropdownMenuLabel className="px-2 py-1.5 text-[13px] font-normal text-muted-foreground">
					Model
				</DropdownMenuLabel>
				<MenuScrollArea>
					<DropdownMenuRadioGroup value={selectedId} onValueChange={onSelect}>
						{models.map((model) => (
							<DropdownMenuRadioItem
								key={model.id}
								value={model.id}
								className={cn(menuItemHeight, 'gap-2.5 rounded-lg px-2')}
							>
								<span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
									<ModelLogo family={model.family} />
								</span>
								<span className="flex min-w-0 flex-col">
									<span className="truncate font-medium">{model.label}</span>
									<span className="truncate text-[13px] text-muted-foreground">
										{model.goodAt}
									</span>
								</span>
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>
				</MenuScrollArea>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
