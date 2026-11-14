'use client';

import type { AiModel } from '@orbi/shared';
import { ChevronDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ModelLogo } from './model-logo';
import { ModelMenu } from './model-menu';

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
						<ModelLogo provider={selected.provider} />
					) : (
						<Sparkles className="size-4" />
					)}
					<span className="hidden sm:inline">{label}</span>
					<ChevronDown className="size-3.5 text-muted-foreground" />
				</Button>
			</DropdownMenuTrigger>
			<ModelMenu models={models} selectedId={selectedId} onSelect={onSelect} />
		</DropdownMenu>
	);
}
