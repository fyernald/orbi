'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
	tutorRequestInput,
	type TutorAction,
	type TutorRequestInput,
} from '@orbi/shared';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { composerActions } from '../actions';
import { sendBlockedReason } from '../composer';
import { useAttachments, useFileDrop, useModels } from '../hooks';
import type { Topic } from '../mock-data';
import { AttachmentList } from './attachment-list';
import { ComposerContext } from './composer-context';
import { ComposerNote } from './composer-note';
import { ComposerToolbar } from './composer-toolbar';
import { DropOverlay } from './drop-overlay';
import { NotesField } from './notes-field';

// lets the page around the composer pick an action, a topic, or a message,
// for example from a study tool; a new version applies it again
export type ComposerPreset = {
	version: number;
	action?: TutorAction;
	topicId?: string;
	modelId?: string;
	message?: string;
};

// what the student had in the composer when they picked another topic
export type ComposerDraft = {
	message: string;
	action: TutorAction;
	modelId: string;
};

type NoteComposerProps = {
	topics: Topic[];
	// the topic it starts on; '' is the whole course
	topicId?: string;
	// the course's name, when the composer can send about the whole course
	wholeCourse?: string;
	// picking a topic opens that topic's chat, with the draft; '' is the whole course
	onTopicChange?: (topicId: string, draft: ComposerDraft) => void;
	// inside a course, the topic menu adds a topic right there
	onAddTopic?: () => void;
	preset?: ComposerPreset;
	// without it the composer is only a preview (Home, until it has real topics)
	onSend?: (request: TutorRequestInput) => void;
	// a reply is on its way: the send button stops it instead
	busy?: boolean;
	onStop?: () => void;
	// a reason from outside the form, like the limit on parallel replies
	limitReason?: string | null;
};

export function NoteComposer({
	topics,
	topicId,
	wholeCourse,
	onTopicChange,
	onAddTopic,
	preset,
	onSend,
	busy = false,
	onStop,
	limitReason,
}: NoteComposerProps) {
	const models = useModels();
	const form = useForm<TutorRequestInput>({
		resolver: zodResolver(tutorRequestInput),
		defaultValues: {
			action: 'ask',
			topicId: topicId ?? topics[0]?.id ?? '',
			modelId: '',
			message: '',
		},
	});
	const values = form.watch();
	const { attachments, add, remove } = useAttachments();
	const { isDragging, dropZoneProps } = useFileDrop(add);

	// the list comes from the server, so the default model is set once it is there
	const defaultModelId = models.data?.defaultModelId;
	useEffect(() => {
		if (defaultModelId && !form.getValues('modelId')) {
			form.setValue('modelId', defaultModelId);
		}
	}, [defaultModelId, form]);

	useEffect(() => {
		if (!preset) return;
		if (preset.action) form.setValue('action', preset.action);
		if (preset.topicId) form.setValue('topicId', preset.topicId);
		if (preset.modelId) form.setValue('modelId', preset.modelId);
		if (preset.message !== undefined) form.setValue('message', preset.message);
		form.setFocus('message');
		// only a new version applies the preset, not every render
	}, [preset?.version]);

	const action = composerActions[values.action];
	const noModels = models.isSuccess && models.data.models.length === 0;
	const blockedReason = noModels
		? 'The AI tutor is not set up on this server yet.'
		: (limitReason ??
			sendBlockedReason({
				values,
				attachments,
				allowWholeCourse: wholeCourse !== undefined,
			}));
	const focusMessage = () => form.setFocus('message');

	const send = (request: TutorRequestInput) => {
		if (busy) return;
		if (blockedReason || !onSend) {
			focusMessage();
			return;
		}
		onSend(request);
		form.setValue('message', '');
		focusMessage();
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
					<ComposerContext
						control={form.control}
						topics={topics}
						wholeCourse={wholeCourse}
						onTopicChange={
							onTopicChange &&
							((next) => {
								if (next === form.getValues('topicId')) return;
								const { message, action, modelId } = form.getValues();
								// the draft goes with the student to the other chat
								form.setValue('message', '');
								onTopicChange(next, { message, action, modelId });
							})
						}
						onAddTopic={onAddTopic}
					/>
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
					models={models.data?.models ?? []}
					onFiles={add}
					sendLabel={action.submitLabel}
					blockedReason={blockedReason}
					busy={busy}
					onStop={onStop}
				/>
				{isDragging && <DropOverlay />}
			</form>
			<ComposerNote text={action.note} />
		</div>
	);
}
