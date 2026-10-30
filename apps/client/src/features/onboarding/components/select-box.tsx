'use client';

import { ChevronDown } from 'lucide-react';
import { useId, type CSSProperties } from 'react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { SelectBoxItem } from './select-box-item';

export type SelectOption = { value: string; label: string };

type SelectBoxProps = {
	label: string;
	value: string;
	options: SelectOption[];
	// shown until something is picked
	placeholder?: string;
	// its place on the screen, so it comes in after what is above it
	order: number;
	onChange: (value: string) => void;
};

// Orbi's dropdown menu used as a select; typing jumps to a matching option
export function SelectBox({
	label,
	value,
	options,
	placeholder,
	order,
	onChange,
}: SelectBoxProps) {
	const id = useId();
	const labelId = `${id}-label`;
	const valueId = `${id}-value`;
	const selected = options.find((option) => option.value === value);

	return (
		<div
			style={{ '--stagger': order } as CSSProperties}
			className="stagger-in flex min-w-0 flex-col gap-2"
		>
			<span id={labelId} className="text-sm text-muted-foreground">
				{label}
			</span>
			{/* not modal, so one click on the next field closes this list and opens that one */}
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						aria-labelledby={`${labelId} ${valueId}`}
						className="group flex h-12 w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-input bg-card/70 px-4 text-left text-base backdrop-blur-sm transition-colors outline-none hover:border-primary/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=open]:border-ring"
					>
						<span
							id={valueId}
							className={cn('truncate', !selected && 'text-muted-foreground')}
						>
							{selected?.label ?? placeholder}
						</span>
						<ChevronDown
							aria-hidden="true"
							className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
						/>
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="start"
					sideOffset={6}
					className="max-h-72 rounded-xl p-1.5 shadow-sm"
				>
					<DropdownMenuRadioGroup value={value} onValueChange={onChange}>
						{options.map((option) => (
							<SelectBoxItem
								key={option.value}
								option={option}
								checked={option === selected}
							/>
						))}
					</DropdownMenuRadioGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
