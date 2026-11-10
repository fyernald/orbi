'use client';

import type { ControlType, InteractiveControl } from '@orbi/shared';
import { Minus, Plus } from 'lucide-react';
import { useState, type ComponentType } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	NativeSelect,
	NativeSelectOption,
} from '@/components/ui/native-select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
	controlStep,
	fitToControl,
	formatControlValue,
} from '../../../visuals/control-values';

export type ControlInputProps = {
	control: InteractiveControl;
	value: number;
	onChange: (value: number) => void;
	// the id of the control's visible label, which names it for screen readers
	labelId: string;
};

function SliderInput({ control, value, onChange, labelId }: ControlInputProps) {
	return (
		<Slider
			min={control.min}
			max={control.max}
			step={controlStep(control)}
			value={[value]}
			onValueChange={([next]) => {
				if (next !== undefined) onChange(next);
			}}
			thumbProps={{
				'aria-labelledby': labelId,
				'aria-valuetext': formatControlValue(control, value),
			}}
			className="py-2"
		/>
	);
}

// A number the student types. It stays as typed until they leave the field or
// press Enter, then fits the range, so typing "-" or "1." is not undone.
function NumberInput({ control, value, onChange, labelId }: ControlInputProps) {
	const [draft, setDraft] = useState<string>();
	const commit = () => {
		if (draft !== undefined) {
			onChange(fitToControl(control, Number(draft), value));
		}
		setDraft(undefined);
	};
	return (
		<Input
			type="number"
			inputMode="decimal"
			aria-labelledby={labelId}
			min={control.min}
			max={control.max}
			step={controlStep(control)}
			value={draft ?? String(value)}
			onChange={(event) => setDraft(event.target.value)}
			onBlur={commit}
			onKeyDown={(event) => {
				if (event.key === 'Enter') commit();
			}}
			className="w-24 text-right tabular-nums"
		/>
	);
}

function StepperInput({
	control,
	value,
	onChange,
	labelId,
}: ControlInputProps) {
	const step = controlStep(control);
	const move = (by: number) =>
		onChange(fitToControl(control, value + by, value));
	return (
		<div
			role="group"
			aria-labelledby={labelId}
			className="flex items-center gap-1"
		>
			<Button
				variant="outline"
				size="icon-sm"
				aria-label="Lower"
				disabled={control.min !== undefined && value <= control.min}
				onClick={() => move(-step)}
			>
				<Minus />
			</Button>
			<output
				aria-live="polite"
				className="min-w-12 text-center text-sm font-semibold tabular-nums"
			>
				{formatControlValue(control, value)}
			</output>
			<Button
				variant="outline"
				size="icon-sm"
				aria-label="Raise"
				disabled={control.max !== undefined && value >= control.max}
				onClick={() => move(step)}
			>
				<Plus />
			</Button>
		</div>
	);
}

function ToggleInput({ value, onChange, labelId }: ControlInputProps) {
	return (
		<Switch
			aria-labelledby={labelId}
			checked={value === 1}
			onCheckedChange={(checked) => onChange(checked ? 1 : 0)}
		/>
	);
}

function SelectInput({ control, value, onChange, labelId }: ControlInputProps) {
	return (
		<NativeSelect
			aria-labelledby={labelId}
			value={String(value)}
			onChange={(event) => onChange(Number(event.target.value))}
		>
			{control.options?.map((option) => (
				<NativeSelectOption key={option.label} value={String(option.value)}>
					{option.label}
				</NativeSelectOption>
			))}
		</NativeSelect>
	);
}

// the input each control type moves with; every one works with the keyboard and touch
export const controlInputs: Record<
	ControlType,
	ComponentType<ControlInputProps>
> = {
	slider: SliderInput,
	number: NumberInput,
	stepper: StepperInput,
	toggle: ToggleInput,
	select: SelectInput,
};
