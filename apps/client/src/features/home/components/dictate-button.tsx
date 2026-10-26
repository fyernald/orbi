import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DictateButton() {
	return (
		<Button
			type="button"
			variant="outline"
			aria-label="Dictate notes"
			title="Dictate notes: Orbi types what you say"
			className="size-10 rounded-full text-subtle-foreground"
		>
			<Mic className="size-[18px]" />
		</Button>
	);
}
