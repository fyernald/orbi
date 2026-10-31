'use client';

import { LoadError } from '@/components/load-error';
import { apiErrorMessage } from '@/lib/api';
import { useNotes } from '../hooks';
import { NoteCard } from './note-card';
import { NotesEmpty } from './notes-empty';

type NotesListProps = {
	courseId: string;
	topicId: string;
};

// the topic's saved notes, newest first
export function NotesList({ courseId, topicId }: NotesListProps) {
	const notes = useNotes(courseId, topicId);

	if (notes.isPending) {
		return (
			<div
				aria-busy="true"
				aria-label="Loading notes"
				className="flex flex-col gap-2"
			>
				{[0, 1].map((row) => (
					<div key={row} className="h-24 animate-pulse rounded-xl bg-muted" />
				))}
			</div>
		);
	}
	if (notes.isError) {
		return (
			<LoadError
				message={apiErrorMessage(notes.error)}
				onRetry={() => notes.refetch()}
			/>
		);
	}
	if (notes.data.length === 0) return <NotesEmpty />;

	return (
		<ul aria-label="Saved notes" className="flex flex-col gap-2">
			{notes.data.map((note) => (
				<li key={note.id}>
					<NoteCard note={note} />
				</li>
			))}
		</ul>
	);
}
