'use client';

import { COURSE_GOALS, type CourseGoal } from '@orbi/shared';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CourseFilters } from '../course-filters';
import { goals } from '../goals';

type CoursesToolbarProps = {
	filters: CourseFilters;
	onFiltersChange: (filters: CourseFilters) => void;
};

const goalFilters: { value: CourseGoal | 'all'; label: string }[] = [
	{ value: 'all', label: 'All' },
	...COURSE_GOALS.map((goal) => ({
		value: goal,
		label: goals[goal].shortLabel,
	})),
];

export function CoursesToolbar({
	filters,
	onFiltersChange,
}: CoursesToolbarProps) {
	const update = (changes: Partial<CourseFilters>) =>
		onFiltersChange({ ...filters, ...changes });

	return (
		<div className="flex flex-wrap items-center gap-2">
			<div
				role="radiogroup"
				aria-label="Goal"
				className="flex flex-wrap gap-1.5"
			>
				{goalFilters.map(({ value, label }) => {
					const checked = filters.goal === value;
					return (
						<button
							key={value}
							type="button"
							role="radio"
							aria-checked={checked}
							onClick={() => update({ goal: value })}
							className={cn(
								'h-8 rounded-full border px-3 text-sm transition-colors',
								checked
									? 'border-foreground bg-foreground text-background'
									: 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
							)}
						>
							{label}
						</button>
					);
				})}
			</div>
			<div className="relative ml-auto w-full sm:w-56">
				<Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
				<input
					type="search"
					value={filters.query}
					onChange={(event) => update({ query: event.target.value })}
					placeholder="Find a course"
					aria-label="Find a course"
					className="h-8 w-full rounded-full border border-input bg-transparent pr-8 pl-8 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-search-cancel-button]:hidden"
				/>
				{filters.query && (
					<button
						type="button"
						onClick={() => update({ query: '' })}
						aria-label="Clear search"
						className="absolute top-1/2 right-1.5 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
					>
						<X className="size-3.5" />
					</button>
				)}
			</div>
		</div>
	);
}
