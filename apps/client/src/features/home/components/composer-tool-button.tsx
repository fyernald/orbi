import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ComposerToolButtonProps = {
	icon: LucideIcon;
	label: string;
	hint: string;
	onClick?: () => void;
};

export function ComposerToolButton({
	icon: Icon,
	label,
	hint,
	onClick,
}: ComposerToolButtonProps) {
	return (
		<Button
			type="button"
			variant="outline"
			title={hint}
			aria-label={label}
			onClick={onClick}
			className="h-9 gap-1.5 rounded-full px-2.5 text-[13px] text-subtle-foreground sm:pr-3"
		>
			<Icon className="size-4" />
			<span className="hidden sm:inline">{label}</span>
		</Button>
	);
}
