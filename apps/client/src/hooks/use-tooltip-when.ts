'use client';

import { useState } from 'react';

// open state for a tooltip that may only show while `allowed` is true.
// Radix tells us when a hover opens it, but not when that hover ends while it is
// hidden, so a hover from before `allowed` changed is forgotten when it changes;
// otherwise it would pop up later without the pointer being there.
// The tooltip stays controlled, because Radix warns when it switches.
export function useTooltipWhen(allowed: boolean) {
	const [open, setOpen] = useState(false);
	const [allowedBefore, setAllowedBefore] = useState(allowed);

	if (allowed !== allowedBefore) {
		setAllowedBefore(allowed);
		setOpen(false);
	}

	return { open: allowed && open, onOpenChange: setOpen };
}
