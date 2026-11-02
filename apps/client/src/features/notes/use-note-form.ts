'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { createNoteInput, type CreateNoteInput } from '@orbi/shared';
import { useForm } from 'react-hook-form';

const EMPTY_NOTE: CreateNoteInput = { title: '', content: '' };

// a new note and an edited one follow the same rules
export function useNoteForm(saved: CreateNoteInput = EMPTY_NOTE) {
	return useForm<CreateNoteInput>({
		resolver: zodResolver(createNoteInput),
		defaultValues: saved,
	});
}
