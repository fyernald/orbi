import type { CSSProperties } from 'react';
import { OrbiMark } from '@/components/brand/orbi-mark';

// how Orbi will greet the student, updated as they type
export function GreetingPreview({ name }: { name: string }) {
	return (
		<div
			aria-live="polite"
			style={{ '--stagger': 1 } as CSSProperties}
			className="stagger-in flex items-center gap-3 rounded-2xl border border-border bg-card/70 p-4 backdrop-blur-sm"
		>
			<OrbiMark className="size-8" />
			<p className="min-w-0 text-sm">
				<span className="text-muted-foreground">Orbi says: </span>
				<span className="font-medium break-words">
					Hi {name || 'there'}, ready to study?
				</span>
			</p>
		</div>
	);
}
