'use client';

import { useEffect, type RefObject } from 'react';
import { handlesEnter } from './keyboard';

// Enter goes on from anywhere on the page, also when the focus is on the question heading
export function useEnterToSubmit(form: RefObject<HTMLFormElement | null>) {
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== 'Enter' || event.defaultPrevented) return;
			if (handlesEnter(event.target)) return;
			event.preventDefault();
			form.current?.requestSubmit();
		};
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [form]);
}
