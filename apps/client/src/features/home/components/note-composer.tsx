'use client';

import { NotebookText, Paperclip } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { ComposerContext } from './composer-context';
import { ComposerToolButton } from './composer-tool-button';
import { DictateButton } from './dictate-button';
import { GenerateButton } from './generate-button';

type NoteComposerProps = {
	course: string;
	topic: string;
};

export function NoteComposer({ course, topic }: NoteComposerProps) {
	const [notes, setNotes] = useState('');

	const handleSubmit = (event: FormEvent) => {
		event.preventDefault();
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="rounded-3xl border border-border bg-card p-2 transition-colors focus-within:border-[#cdd6fb]"
		>
			<ComposerContext course={course} topic={topic} />
			<label htmlFor="home-notes" className="sr-only">
				Your notes
			</label>
			<textarea
				id="home-notes"
				rows={3}
				value={notes}
				onChange={(event) => setNotes(event.target.value)}
				placeholder="Paste your notes or drop a PDF. Orbi turns them into practice questions."
				className="field-sizing-content block max-h-64 min-h-24 w-full resize-none bg-transparent px-3 pt-3.5 pb-1.5 text-base leading-relaxed outline-none placeholder:text-[#8792a8]"
			/>
			<div className="flex items-center gap-1.5 p-1">
				<ComposerToolButton
					icon={Paperclip}
					label="Attach"
					hint="Attach a PDF, slides or a photo of notes"
				/>
				<ComposerToolButton
					icon={NotebookText}
					label="From my notes"
					hint="Pick notes you already saved in Orbi"
				/>
				<div className="ml-auto flex items-center gap-1.5">
					<DictateButton />
					<GenerateButton disabled={!notes.trim()} />
				</div>
			</div>
		</form>
	);
}
