'use client';

import { useRef, useState } from 'react';
import { apiErrorMessage } from '@/lib/api';
import { mascotAnnouncement } from '../announcement';
import {
	useDismissedTips,
	useDismissTip,
	useMascotEnabled,
	useSaveMascot,
} from '../hooks';
import type { MascotSaved } from '../types';
import { useCurrentTip } from '../use-current-tip';
import { useFirstVisitWave } from '../use-first-visit-wave';
import { HelpDialog } from './help-dialog';
import { MascotMenu } from './mascot-menu';
import { TipBubble } from './tip-bubble';

type MascotSpotProps = {
	// the cat's setting and closed tips, as the server sent them with the page
	saved: MascotSaved;
};

// The cat's fixed place at the end of the top bar (US-48): on every page, on
// phone and wide screens, and never over the page's own content. Its tips
// come up under it.
export function MascotSpot({ saved }: MascotSpotProps) {
	const enabled = useMascotEnabled(saved.mascotEnabled);
	const hide = useSaveMascot();
	const dismiss = useDismissTip();
	const [menuOpen, setMenuOpen] = useState(false);
	const [helpOpen, setHelpOpen] = useState(false);
	const current = useCurrentTip(
		useDismissedTips(saved.dismissedTips),
		menuOpen || helpOpen
	);
	const cat = useRef<HTMLButtonElement>(null);
	const tip = enabled ? current.tip : null;
	useFirstVisitWave(enabled);

	return (
		<div className="relative">
			{enabled && (
				<MascotMenu
					open={menuOpen}
					onOpenChange={setMenuOpen}
					triggerRef={cat}
					onHelp={() => setHelpOpen(true)}
					onHide={() => hide.mutate({ mascotEnabled: false })}
				/>
			)}
			{tip && (
				<TipBubble
					key={tip.id}
					tip={tip}
					onClose={() => {
						dismiss.mutate(tip.id);
						current.quiet();
					}}
					returnFocus={() => cat.current?.focus()}
				/>
			)}
			<HelpDialog
				open={helpOpen}
				onOpenChange={setHelpOpen}
				returnFocus={() => cat.current?.focus()}
			/>
			<p aria-live="polite" className="sr-only">
				{mascotAnnouncement({
					hideError: hide.isError ? apiErrorMessage(hide.error) : undefined,
					hidden: hide.isSuccess && !enabled,
					tip,
				})}
			</p>
		</div>
	);
}
