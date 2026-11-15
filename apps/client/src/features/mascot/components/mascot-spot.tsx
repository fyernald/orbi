'use client';

import { useRef, useState } from 'react';
import { apiErrorMessage } from '@/lib/api';
import { useMascotEnabled, useSaveMascot } from '../hooks';
import { HelpDialog } from './help-dialog';
import { MascotMenu } from './mascot-menu';

const MASCOT_HIDDEN_MESSAGE =
	'The cat is hidden. You can turn it back on in Settings.';

type MascotSpotProps = {
	// whether the cat shows, as the server sent it with the page
	saved: boolean;
};

// The cat's fixed place at the end of the top bar (US-48): on every page, on
// phone and wide screens, and never over the page's own content
export function MascotSpot({ saved }: MascotSpotProps) {
	const enabled = useMascotEnabled(saved);
	const hide = useSaveMascot();
	const [helpOpen, setHelpOpen] = useState(false);
	const cat = useRef<HTMLButtonElement>(null);

	// the button is gone after Hide, so screen readers hear where it went
	const announcement = hide.isError
		? apiErrorMessage(hide.error)
		: hide.isSuccess && !enabled
			? MASCOT_HIDDEN_MESSAGE
			: '';

	return (
		<>
			{enabled && (
				<MascotMenu
					triggerRef={cat}
					onHelp={() => setHelpOpen(true)}
					onHide={() => hide.mutate({ mascotEnabled: false })}
				/>
			)}
			<HelpDialog
				open={helpOpen}
				onOpenChange={setHelpOpen}
				returnFocus={() => cat.current?.focus()}
			/>
			<p aria-live="polite" className="sr-only">
				{announcement}
			</p>
		</>
	);
}
