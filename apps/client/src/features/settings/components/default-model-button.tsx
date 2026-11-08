'use client';

import type { AiModel } from '@orbi/shared';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ModelLogo } from '@/features/tutor/components/model-logo';
import { ModelMenu } from '@/features/tutor/components/model-menu';

type DefaultModelButtonProps = {
	id: string;
	models: AiModel[];
	selectedId: string;
	disabled: boolean;
	onSelect: (modelId: string) => void;
};

// the default model, with its name always shown; it opens the chat's model list
export function DefaultModelButton({
	id,
	models,
	selectedId,
	disabled,
	onSelect,
}: DefaultModelButtonProps) {
	const selected = models.find((model) => model.id === selectedId);
	const label = selected?.label ?? 'Choose a model';

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					id={id}
					type="button"
					variant="outline"
					disabled={disabled}
					aria-label={`Default model: ${label}`}
					className="h-10 shrink-0 gap-2 rounded-full px-3.5"
				>
					{selected && <ModelLogo provider={selected.provider} />}
					{label}
					<ChevronDown className="size-3.5 text-muted-foreground" />
				</Button>
			</DropdownMenuTrigger>
			<ModelMenu models={models} selectedId={selectedId} onSelect={onSelect} />
		</DropdownMenu>
	);
}
