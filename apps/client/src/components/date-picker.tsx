'use client';

import { CalendarDays, ChevronsUpDown } from 'lucide-react';
import { useState, type Ref } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { formatLongDate, fromIsoDate, toIsoDate } from '@/lib/dates';
import { cn } from '@/lib/utils';

type DatePickerProps = {
	id?: string;
	// "YYYY-MM-DD", or null for no date
	value: string | null;
	onChange: (value: string | null) => void;
	// days before it cannot be picked
	min?: string;
	placeholder?: string;
	invalid?: boolean;
	buttonRef?: Ref<HTMLButtonElement>;
	'aria-describedby'?: string;
};

// a button that shows the date and opens a calendar; the browser's own date input
// looks different on every system
export function DatePicker({
	id,
	value,
	onChange,
	min,
	placeholder = 'Pick a date',
	invalid = false,
	buttonRef,
	'aria-describedby': describedBy,
}: DatePickerProps) {
	const [open, setOpen] = useState(false);
	const selected = value ? fromIsoDate(value) : undefined;
	const minDate = min ? fromIsoDate(min) : undefined;
	const today = toIsoDate(new Date());

	const pick = (next: string | null) => {
		onChange(next);
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					ref={buttonRef}
					id={id}
					type="button"
					aria-invalid={invalid || undefined}
					aria-describedby={describedBy}
					// like a date input, Enter sends the form; Space and the arrow keys open the calendar
					onKeyDown={(event) => {
						if (event.key !== 'Enter' || !event.currentTarget.form) return;
						event.preventDefault();
						event.currentTarget.form.requestSubmit();
					}}
					className="flex h-10 w-full items-center gap-2.5 rounded-xl border border-input bg-transparent px-3 text-left text-sm transition-colors outline-none hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-expanded:border-ring aria-expanded:ring-3 aria-expanded:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
				>
					<CalendarDays className="size-4 shrink-0 text-muted-foreground" />
					<span
						className={cn('flex-1 truncate', !value && 'text-muted-foreground')}
					>
						{value ? formatLongDate(value) : placeholder}
					</span>
					<ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
				</button>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-auto p-3">
				<Calendar
					mode="single"
					// picking the chosen day again keeps it; Clear removes it
					required
					selected={selected}
					defaultMonth={selected ?? minDate}
					onSelect={(date) => pick(toIsoDate(date))}
					disabled={minDate ? { before: minDate } : undefined}
					startMonth={minDate}
					autoFocus
				/>
				<div className="mt-3 flex items-center justify-between border-t border-divider pt-3">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => pick(null)}
						disabled={!value}
						className="rounded-full"
					>
						Clear
					</Button>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => pick(today)}
						disabled={min !== undefined && today < min}
						className="rounded-full"
					>
						Today
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
