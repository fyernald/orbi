'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useEffectEvent, useState } from 'react';
import type { ComposerPreset } from '@/features/tutor/components/note-composer';
import { COMPOSE_PARAM } from '@/lib/routes';

// ?compose=1 (Ask Orbi in the cat's menu) puts the focus in Home's message box.
// It leaves the address at once, so a reload does not do it again, and asking
// again while on Home works.
export function useComposeRequest(): ComposerPreset | undefined {
	const asked = useSearchParams().get(COMPOSE_PARAM) === '1';
	const [preset, setPreset] = useState<ComposerPreset>();

	const take = useEffectEvent(() => {
		const { pathname, hash } = window.location;
		window.history.replaceState(null, '', `${pathname}${hash}`);
		setPreset({ version: Date.now() });
	});
	useEffect(() => {
		if (asked) take();
	}, [asked]);

	return preset;
}
