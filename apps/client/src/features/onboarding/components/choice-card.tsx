import { CircleCheck, type LucideIcon } from 'lucide-react';
import type { CSSProperties } from 'react';
import { KeyHint } from '@/components/key-hint';
import { cn } from '@/lib/utils';

type ChoiceCardProps = {
	name: string;
	// radio for one answer, checkbox when several can be picked
	type: 'radio' | 'checkbox';
	label: string;
	description: string;
	icon: LucideIcon;
	checked: boolean;
	disabled: boolean;
	// the number key that picks it
	shortcut: number;
	// its place in the list, so the cards come in one after another
	order: number;
	onChange: () => void;
};

export function ChoiceCard({
	name,
	type,
	label,
	description,
	icon: Icon,
	checked,
	disabled,
	shortcut,
	order,
	onChange,
}: ChoiceCardProps) {
	return (
		<label
			style={{ '--stagger': order } as CSSProperties}
			className={cn(
				'stagger-in group relative flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-[background-color,border-color,box-shadow,scale] duration-200 has-focus-visible:ring-3 has-focus-visible:ring-ring/50 active:scale-[0.98]',
				checked
					? 'border-primary bg-primary/8 shadow-[0_0_0_1px_var(--primary)]'
					: 'border-border bg-card/70 backdrop-blur-sm hover:border-primary/40 hover:bg-card',
				disabled && 'cursor-not-allowed opacity-45 active:scale-100'
			)}
		>
			<input
				type={type}
				name={name}
				checked={checked}
				disabled={disabled}
				onChange={onChange}
				className="sr-only"
			/>
			<span
				aria-hidden="true"
				className={cn(
					'flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-200',
					checked
						? 'bg-primary text-primary-foreground'
						: 'bg-muted text-muted-foreground group-hover:text-foreground'
				)}
			>
				<Icon className="size-5" />
			</span>
			<span className="flex min-w-0 flex-1 flex-col gap-0.5">
				<span className="font-medium">{label}</span>
				<span className="text-sm text-muted-foreground">{description}</span>
			</span>
			{checked ? (
				<CircleCheck
					aria-hidden="true"
					className="pop-in size-5 shrink-0 fill-primary text-primary-foreground"
				/>
			) : (
				<span aria-hidden="true" className="hidden sm:flex">
					<KeyHint>{shortcut}</KeyHint>
				</span>
			)}
		</label>
	);
}
