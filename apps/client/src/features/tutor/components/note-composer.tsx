'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
	tutorRequestInput,
	type MessageAttachment,
	type TutorAction,
	type TutorRequestInput,
} from '@orbi/shared';
import { useEffect, useEffectEvent } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { ComposerUsageNotice } from '@/features/usage/components/composer-usage-notice';
import { useUsageBlock } from '@/features/usage/hooks';
import { composerActions } from '../actions';
import { messageAttachments } from '../attachments';
import { sendBlockedReason, type ComposerTopic } from '../composer';
import { useModels } from '../hooks';
import { useAttachments } from '../use-attachments';
import { useFileDrop } from '../use-file-drop';
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
	thinking?: boolean;
	message?: string;
};

// what the student had in the composer when they picked another topic
export type ComposerDraft = {
	message: string;
	action: TutorAction;
	modelId: string;
	thinking: boolean;
};

type NoteComposerProps = {
	topics: ComposerTopic[];
	// attached PDFs are saved to the picked topic of this course; without it
	// (Home, until it has real topics) files cannot be attached
	courseId?: string;
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
	onSend?: (
		request: TutorRequestInput,
		attachments: MessageAttachment[]
	) => void;
	// a reply is on its way: the send button stops it instead
	busy?: boolean;
	onStop?: () => void;
	// a reason from outside the form, like the limit on parallel replies
	limitReason?: string | null;
};

export function NoteComposer({
	topics,
	courseId,
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
			thinking: false,
			message: '',
		},
	});
	// only what this component shows; watching the whole form here re-rendered
	// the menus on every key, which made Radix throw "Maximum update depth exceeded"
	const [actionId, pickedTopicId] = useWatch({
		control: form.control,
		name: ['action', 'topicId'],
	});
	const { attachments, add, remove, clearSaved } = useAttachments(
		courseId && pickedTopicId ? { courseId, topicId: pickedTopicId } : null
	);
	const { isDragging, dropZoneProps } = useFileDrop(add);
	const canAttach = courseId !== undefined;

	// the list comes from the server, so the default model is set once it is there
	const defaultModelId = models.data?.defaultModelId;
	useEffect(() => {
		if (defaultModelId && !form.getValues('modelId')) {
			form.setValue('modelId', defaultModelId);
		}
	}, [defaultModelId, form]);

	const applyPreset = useEffectEvent(() => {
		if (!preset) return;
		if (preset.action) form.setValue('action', preset.action);
		if (preset.topicId) form.setValue('topicId', preset.topicId);
		if (preset.modelId) form.setValue('modelId', preset.modelId);
		if (preset.thinking !== undefined) {
			form.setValue('thinking', preset.thinking);
		}
		if (preset.message !== undefined) form.setValue('message', preset.message);
		form.setFocus('message');
	});
	// only a new version applies the preset, not every render
	const presetVersion = preset?.version;
	useEffect(() => {
		applyPreset();
	}, [presetVersion]);

	const action = composerActions[actionId];
	// an AI usage limit is used up; the server would refuse the same way
	const usageBlock = useUsageBlock();
	const noModels = models.isSuccess && models.data.models.length === 0;
	const blockedReason = (values: Partial<TutorRequestInput>) =>
		noModels
			? 'The AI tutor is not set up on this server yet.'
			: (usageBlock ??
				limitReason ??
				sendBlockedReason({
					values,
					attachments,
					allowWholeCourse: wholeCourse !== undefined,
				}));
	const focusMessage = () => form.setFocus('message');

	const send = (request: TutorRequestInput) => {
		if (busy) return;
		if (blockedReason(request) || !onSend) {
			focusMessage();
			return;
		}
		onSend(request, messageAttachments(attachments));
		clearSaved();
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
			<ComposerUsageNotice />
			<form
				method="post"
				onSubmit={form.handleSubmit(send, focusMessage)}
				noValidate
				{...(canAttach && dropZoneProps)}
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
								const { message, action, modelId, thinking } = form.getValues();
								// the draft goes with the student to the other chat
								form.setValue('message', '');
								onTopicChange(next, { message, action, modelId, thinking });
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
					onFiles={canAttach ? add : undefined}
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
