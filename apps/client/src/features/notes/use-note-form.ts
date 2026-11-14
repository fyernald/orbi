'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { createNoteInput, type CreateNoteInput } from '@orbi/shared';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { noteDrafts } from './note-drafts';

export const EMPTY_NOTE: CreateNoteInput = { title: '', content: '' };

// a new note and an edited one follow the same rules
export function useNoteForm(saved: CreateNoteInput = EMPTY_NOTE) {
	return useForm<CreateNoteInput>({
		resolver: zodResolver(createNoteInput),
		defaultValues: saved,
	});
}

// The form starts from the text left unsaved before, if any, and keeps what is
// typed as a draft until clearDraft (T-42)
export function useDraftedNoteForm(
	draftKey: string,
	saved: CreateNoteInput = EMPTY_NOTE
) {
	const [start] = useState(() => noteDrafts.read(draftKey) ?? saved);
	const form = useNoteForm(start);
	const { title = '', content } = saved;

	useEffect(() => {
		const { unsubscribe } = form.watch((values) =>
			noteDrafts.save(
				draftKey,
				{ title: values.title ?? '', content: values.content ?? '' },
				{ title, content }
			)
		);
		return unsubscribe;
	}, [form, draftKey, title, content]);

	return { form, clearDraft: () => noteDrafts.clear(draftKey) };
}
