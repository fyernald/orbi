'use client';

import { Square } from 'lucide-react';
import { Button } from '@/components/ui/button';

// takes the send button's place while Orbi writes; what was written so far stays
export function StopButton({ onStop }: { onStop: () => void }) {
	return (
		<Button
			type="button"
			onClick={onStop}
			aria-label="Stop the reply"
			className="size-9 rounded-full bg-foreground p-0 text-background hover:bg-foreground/85"
		>
			<Square className="size-3.5 fill-current" strokeWidth={0} />
		</Button>
	);
}
