'use client';

import { useId } from 'react';
import { Switch } from '@/components/ui/switch';

type TidySwitchProps = {
	checked: boolean;
	onChange: (checked: boolean) => void;
};

// off: the note is what was said, word for word; on: Orbi fixes mistakes and
// adds a title, headings and lists, with the same model
export function TidySwitch({ checked, onChange }: TidySwitchProps) {
	const id = useId();

	return (
		<div className="flex items-center gap-2 px-1.5">
			<Switch
				id={id}
				checked={checked}
				onCheckedChange={onChange}
				aria-describedby={`${id}-hint`}
			/>
			<label htmlFor={id} className="text-[13px] text-subtle-foreground">
				Tidy up
			</label>
			<span id={`${id}-hint`} className="sr-only">
				Orbi fixes mistakes and adds a title, headings and lists.
			</span>
		</div>
	);
}
