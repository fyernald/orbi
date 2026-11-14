'use client';

import type { ControlValues, InteractiveControl } from '@orbi/shared';
import { useId } from 'react';
import { formatControlValue } from '../../../visuals/control-values';
import { controlInputs } from './control-inputs';

type ControlFieldProps = {
	control: InteractiveControl;
	value: number;
	onChange: (name: string, value: number) => void;
};

// One control: its label, with its input beside it. A slider runs the full width
// under its label, with the value it is at on the right.
function ControlField({ control, value, onChange }: ControlFieldProps) {
	const labelId = useId();
	const Input = controlInputs[control.type];
	const input = (
		<Input
			control={control}
			value={value}
			onChange={(next) => onChange(control.name, next)}
			labelId={labelId}
		/>
	);
	const label = (
		<span id={labelId} className="text-sm text-muted-foreground">
			{control.label}
		</span>
	);
	if (control.type === 'slider') {
		return (
			<div className="flex flex-col gap-1.5">
				<div className="flex items-baseline justify-between gap-3">
					{label}
					<span aria-hidden className="text-sm font-semibold tabular-nums">
						{formatControlValue(control, value)}
					</span>
				</div>
				{input}
			</div>
		);
	}
	return (
		<div className="flex min-h-8 items-center justify-between gap-3">
			{label}
			{input}
		</div>
	);
}

type InteractiveControlsProps = {
	controls: InteractiveControl[];
	values: ControlValues;
	onChange: (name: string, value: number) => void;
};

export function InteractiveControls({
	controls,
	values,
	onChange,
}: InteractiveControlsProps) {
	return (
		<div className="flex flex-col gap-4">
			{controls.map((control) => (
				<ControlField
					key={control.name}
					control={control}
					value={values[control.name] ?? control.value}
					onChange={onChange}
				/>
			))}
		</div>
	);
}
