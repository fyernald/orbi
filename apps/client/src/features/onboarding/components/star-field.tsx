import type { CSSProperties } from 'react';

// three layers of stars; travel moves them on, near layers further than far ones
export function StarField({ travel }: { travel: number }) {
	return (
		<div style={{ '--travel': travel } as CSSProperties}>
			<div className="star-field absolute inset-0" />
			<div className="star-field-twinkle absolute inset-0" />
			<div className="star-field-near absolute inset-0" />
		</div>
	);
}
