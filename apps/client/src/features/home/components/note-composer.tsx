'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { tutorRequestInput, type TutorRequestInput } from '@orbi/shared';
import { useForm } from 'react-hook-form';
import { composerActions } from '../actions';
import { sendBlockedReason } from '../composer';
import { useAttachments, useFileDrop } from '../hooks';
import type { AiModel, Topic } from '../mock-data';
import { AttachmentList } from './attachment-list';
import { ComposerContext } from './composer-context';
import { ComposerNote } from './composer-note';
import { ComposerToolbar } from './composer-toolbar';
import { DropOverlay } from './drop-overlay';
import { NotesField } from './notes-field';

type NoteComposerProps = {
	topics: Topic[];
	models: AiModel[];
	defaultModelId: string;
};

export function NoteComposer({
	topics,
	models,
	defaultModelId,
}: NoteComposerProps) {
	const form = useForm<TutorRequestInput>({
		resolver: zodResolver(tutorRequestInput),
		defaultValues: {
			action: 'ask',
			topicId: topics[0]?.id ?? '',
			modelId: defaultModelId,
			message: '',
		},
	});
	const values = form.watch();
	const { attachments, add, remove } = useAttachments();
	const { isDragging, dropZoneProps } = useFileDrop(add);

	const action = composerActions[values.action];
	const blockedReason = sendBlockedReason({ values, attachments });
	const focusMessage = () => form.setFocus('message');

	// there is no tutor API yet (AI work starts in Sprint 2), so a valid send
	// does nothing for now; a blocked one moves focus to the message
	const send = () => {
		if (blockedReason) focusMessage();
	};

	// the removed chip had focus, so it moves to the message instead of the page
	const removeAttachment = (id: string) => {
		remove(id);
		focusMessage();
	};

	return (
		<div className="flex flex-col gap-3">
			<form
				onSubmit={form.handleSubmit(send, focusMessage)}
				noValidate
				{...dropZoneProps}
				className="relative rounded-3xl border border-border bg-card p-2 transition-colors focus-within:border-primary"
			>
				<div className="flex flex-wrap items-center gap-2 px-2.5 pt-2">
					<ComposerContext control={form.control} topics={topics} />
					<AttachmentList
						attachments={attachments}
						onRemove={removeAttachment}
					/>
				</div>
				<NotesField
					control={form.control}
					label={action.fieldLabel}
					placeholder={action.placeholder}
					sendOnEnter={action.id === 'ask'}
				/>
				<ComposerToolbar
					control={form.control}
					models={models}
					onFiles={add}
					sendLabel={action.submitLabel}
					blockedReason={blockedReason}
				/>
				{isDragging && <DropOverlay />}
			</form>
			<ComposerNote text={action.note} />
		</div>
	);
}
