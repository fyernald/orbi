'use client';

import type { AiModel } from '@orbi/shared';
import {
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { MenuScrollArea, menuItemHeight } from './menu-scroll-area';
import { ModelLogo } from './model-logo';

type ModelMenuProps = {
	models: AiModel[];
	selectedId: string;
	onSelect: (modelId: string) => void;
};

// the list of models with what each is good at; the chat's model picker and the
// default model on the settings page open it
export function ModelMenu({ models, selectedId, onSelect }: ModelMenuProps) {
	return (
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
								<ModelLogo provider={model.provider} />
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
	);
}
