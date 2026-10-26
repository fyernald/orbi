import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function GenerateButton({ disabled }: { disabled: boolean }) {
	return (
		<Button
			type="submit"
			disabled={disabled}
			aria-label="Generate questions"
			title={disabled ? 'Add notes first' : undefined}
			className="h-10 gap-2 rounded-full px-3 text-sm hover:bg-primary/90 disabled:bg-muted disabled:text-[#8792a8] disabled:opacity-100 sm:px-4"
		>
			<span className="hidden sm:inline">Generate questions</span>
			<ArrowUp className="size-4" strokeWidth={2} />
		</Button>
	);
}
