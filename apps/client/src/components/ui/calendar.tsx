'use client';

import * as React from 'react';
import { cn } from 'cn';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker, getDefaultClassNames } from 'react-day-picker';

// react-day-picker with Orbi's look: outlined month arrows, rounded day cells,
// a dot under today, and the chosen day filled with the primary colour
function Calendar({
	className,
	classNames,
	showOutsideDays = true,
	...props
}: React.ComponentProps<typeof DayPicker>) {
	const defaults = getDefaultClassNames();

	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			weekStartsOn={1}
			className={cn('w-fit', className)}
			classNames={{
				root: cn(defaults.root, 'relative'),
				months: 'flex flex-col',
				month: 'flex flex-col gap-3',
				nav: 'absolute inset-x-0 top-0 flex items-center justify-between',
				button_previous:
					'flex size-9 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground shadow-xs transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40',
				button_next:
					'flex size-9 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground shadow-xs transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40',
				month_caption: 'flex h-9 items-center justify-center',
				caption_label: 'text-sm font-medium',
				month_grid: 'border-collapse',
				weekdays: 'flex',
				weekday:
					'w-10 pb-1 text-center text-xs font-normal text-muted-foreground',
				week: 'mt-1 flex',
				day: 'size-10 p-0 text-center text-sm',
				day_button:
					'relative flex size-10 items-center justify-center rounded-xl tabular-nums transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50',
				today:
					'font-semibold [&>button]:after:absolute [&>button]:after:bottom-1.5 [&>button]:after:size-1 [&>button]:after:rounded-full [&>button]:after:bg-primary',
				selected:
					'[&>button]:bg-primary [&>button]:font-medium [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:after:bg-primary-foreground',
				outside: 'text-muted-foreground/50',
				disabled: 'pointer-events-none text-muted-foreground/40',
				hidden: 'invisible',
				...classNames,
			}}
			components={{
				Chevron: ({ orientation }) =>
					orientation === 'left' ? (
						<ChevronLeft className="size-4" />
					) : (
						<ChevronRight className="size-4" />
					),
			}}
			{...props}
		/>
	);
}

export { Calendar };
