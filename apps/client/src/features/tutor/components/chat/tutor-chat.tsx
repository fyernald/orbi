'use client';

import type { TutorRequestInput } from '@orbi/shared';
import { RotateCcw, X } from 'lucide-react';
import {
	useCallback,
	useEffect,
	useRef,
	useState,
	type ReactNode,
} from 'react';
import { OrbiMark } from '@/components/brand/orbi-mark';
import { Button } from '@/components/ui/button';
import {
	chatErrorMessage,
	hasVisibleContent,
	isRejectedRequest,
	messageToSend,
	type TutorUIMessage,
} from '../../chat';
import { useEarlierMessages, useModels, useTutorChat } from '../../hooks';
import type { Topic } from '../../mock-data';
import {
	NoteComposer,
	type ComposerDraft,
	type ComposerPreset,
} from '../note-composer';
import { ChatMessage } from './chat-message';
import { ChatStatusAnnouncer } from './chat-status';
import { ChatThread } from './chat-thread';
import { EarlierMessages } from './earlier-messages';
import { ReplyError } from './reply-error';
import { Thinking } from './thinking';

type TutorChatProps = {
	chatId: string;
	courseId: string;
	// the topic this chat belongs to, or null for the whole-course chat
	chatTopicId: string | null;
	initialMessages: TutorUIMessage[];
	// a long chat opens on its newest messages; older ones load when scrolled to
	initialHasEarlier: boolean;
	// the topics the composer offers; a topic's chat offers only its own
	topics: Topic[];
	preset?: ComposerPreset;
	// shown until the first message
	emptyState: ReactNode;
	// why nothing new can be sent from here right now, like the limit on parallel replies
	limitReason?: string | null;
	onHasMessages?: (hasMessages: boolean) => void;
	onBusyChange?: (busy: boolean) => void;
	// picking another topic in the composer opens its chat; null is the whole course
	onSwitchTopic?: (topicId: string | null, draft: ComposerDraft) => void;
};

export function TutorChat({
	chatId,
	courseId,
	chatTopicId,
	initialMessages,
	initialHasEarlier,
	topics,
	preset,
	emptyState,
	limitReason,
	onHasMessages,
	onBusyChange,
	onSwitchTopic,
}: TutorChatProps) {
	const models = useModels();
	const [notice, setNotice] = useState<string | null>(null);
	// the page's preset and this chat's own restores share one version counter
	const [composerPreset, setComposerPreset] = useState<ComposerPreset>();
	const presetVersion = useRef(0);
	const applyPreset = (changes: Omit<ComposerPreset, 'version'>) => {
		presetVersion.current += 1;
		setComposerPreset({ ...changes, version: presetVersion.current });
	};
	useEffect(() => {
		if (preset) applyPreset(preset);
	}, [preset?.version]);
	const lastStudentMetadata = initialMessages
		.filter(({ role }) => role === 'user')
		.at(-1)?.metadata;
	const defaultModelId = models.data?.defaultModelId;
	const chat = useTutorChat({
		chatId,
		courseId,
		initialMessages,
		fallbackContext: defaultModelId
			? {
					courseId,
					chatTopicId,
					topicId: lastStudentMetadata?.topicId ?? chatTopicId,
					action: lastStudentMetadata?.action ?? 'ask',
					modelId: defaultModelId,
				}
			: null,
		onRejected: (typed, error) => {
			setNotice(chatErrorMessage(error));
			// a refused message goes back into this chat's composer
			if (typed) applyPreset({ message: typed });
		},
	});

	const [hasEarlier, setHasEarlier] = useState(initialHasEarlier);
	const fetchEarlier = useEarlierMessages(chatId);
	const { messages, setMessages } = chat;
	const loadEarlier = useCallback(async () => {
		const first = messages[0];
		if (!first) return;
		const page = await fetchEarlier(first.id);
		setMessages((current) => [
			...page.messages.filter(
				({ id }) => !current.some((message) => message.id === id)
			),
			...current,
		]);
		setHasEarlier(page.hasEarlier);
	}, [messages, fetchEarlier, setMessages]);

	const hasMessages = chat.messages.length > 0;
	useEffect(() => {
		onHasMessages?.(hasMessages);
	}, [hasMessages, onHasMessages]);

	const busy = chat.status === 'submitted' || chat.status === 'streaming';
	useEffect(() => {
		onBusyChange?.(busy);
	}, [busy, onBusyChange]);
	// a chat that stops showing (it unmounts) is no longer running a reply
	useEffect(() => () => onBusyChange?.(false), [onBusyChange]);
	const courseName = topics[0]?.course;
	// a whole-course message is about the course itself
	const topicName = (topicId: string | null | undefined) =>
		topicId === null
			? courseName
			: topics.find(({ id }) => id === topicId)?.name;
	const last = chat.messages.at(-1);
	const waiting =
		busy && (last?.role !== 'assistant' || !hasVisibleContent(last));
	const failed = chat.error && !isRejectedRequest(chat.error);
	// a retry after a reload has no request from this visit, so the saved message tells
	const working = chat.context ?? lastStudentMetadata;
	const workingOn = topicName(working?.topicId);
	const notesOf = workingOn ? `your ${workingOn} notes` : 'your notes';

	const send = (request: TutorRequestInput) => {
		const text = messageToSend(
			request.action,
			request.message,
			topicName(request.topicId || null) ?? ''
		);
		setNotice(null);
		chat.send(
			text,
			{
				courseId,
				chatTopicId,
				topicId: request.topicId || null,
				modelId: request.modelId,
				action: request.action,
			},
			request.message
		);
	};

	return (
		<>
			{!hasMessages ? (
				<div className="min-h-0 flex-1 overflow-y-auto">{emptyState}</div>
			) : (
				<ChatThread>
					<EarlierMessages
						hasEarlier={hasEarlier}
						messageCount={chat.messages.length}
						onLoad={loadEarlier}
					/>
					{chat.messages.map((message, index) => {
						const isLast = index === chat.messages.length - 1;
						// an empty reply is shown as the thinking line below instead
						if (message.role === 'assistant' && !hasVisibleContent(message)) {
							return null;
						}
						return (
							<ChatMessage
								key={message.id}
								message={message}
								streaming={busy && isLast}
								interactive={isLast && !busy}
								actions={{ answer: chat.answer }}
								topicName={topicName}
								model={models.data?.models.find(
									({ id }) => id === message.metadata?.modelId
								)}
								stopped={message.id === chat.stoppedId}
								onRetry={
									isLast && !busy && message.role === 'assistant'
										? chat.retry
										: undefined
								}
							/>
						);
					})}
					{waiting && (
						<div className="flex items-center gap-3">
							<OrbiMark className="size-6" />
							<Thinking
								label={
									working?.action === 'questions'
										? `Writing questions from ${notesOf}…`
										: `Reading ${notesOf}…`
								}
							/>
						</div>
					)}
					{failed && (
						<ReplyError
							message={chatErrorMessage(chat.error)}
							onRetry={chat.retry}
						/>
					)}
					{/* the reply was cut off before it began, for example by a reload */}
					{!busy && !chat.error && last?.role === 'user' && (
						<p className="flex items-center gap-2 pl-9 text-sm text-muted-foreground">
							No reply yet.
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={chat.retry}
								className="h-7 rounded-md px-2"
							>
								<RotateCcw />
								Try again
							</Button>
						</p>
					)}
				</ChatThread>
			)}
			<ChatStatusAnnouncer
				status={chat.status}
				stopped={last?.id === chat.stoppedId}
			/>
			<div className="shrink-0 px-4 pb-4">
				<div className="mx-auto flex w-full max-w-chat flex-col gap-2">
					{notice && (
						<div
							role="status"
							className="flex items-start gap-2 rounded-xl bg-tone-amber px-3.5 py-2.5 text-sm text-tone-amber-foreground"
						>
							<p className="min-w-0 flex-1">{notice}</p>
							<button
								type="button"
								onClick={() => setNotice(null)}
								aria-label="Dismiss"
								className="rounded-md p-0.5 hover:bg-black/5 dark:hover:bg-white/10"
							>
								<X className="size-4" />
							</button>
						</div>
					)}
					<NoteComposer
						topics={topics}
						topicId={chatTopicId ?? ''}
						wholeCourse={courseName}
						onTopicChange={
							onSwitchTopic &&
							((next, draft) => onSwitchTopic(next || null, draft))
						}
						preset={composerPreset}
						onSend={send}
						limitReason={limitReason}
						busy={busy}
						onStop={() => void chat.stop()}
					/>
				</div>
			</div>
		</>
	);
}
