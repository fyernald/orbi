'use client';

import { useCallback } from 'react';
import { DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
import type { SelectOption } from './select-box';

type SelectBoxItemProps = {
	option: SelectOption;
	checked: boolean;
};

// the picked option scrolls into view when the list opens, so a long list
// like the years or the time zones opens where the student left it
export function SelectBoxItem({ option, checked }: SelectBoxItemProps) {
	// stable, so it runs when the list opens and not on every render
	const showWhenChecked = useCallback(
		(item: HTMLDivElement | null) => {
			if (checked) item?.scrollIntoView({ block: 'center' });
		},
		[checked]
	);

	return (
		<DropdownMenuRadioItem
			ref={showWhenChecked}
			value={option.value}
			className="h-10 rounded-lg px-3 text-[15px]"
		>
			<span className="truncate">{option.label}</span>
		</DropdownMenuRadioItem>
	);
}
