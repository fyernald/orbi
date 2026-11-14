'use client';

import type { AiModel } from '@orbi/shared';
import { RotateCcw } from 'lucide-react';
import { OrbiMark } from '@/components/brand/orbi-mark';
import { isToolPart, type TutorUIMessage } from '../../chat';
import { isHiddenVisualError } from '../../visuals/visual-parts';
import { CopyButton } from './copy-button';
import { Markdown } from './markdown';
import { MessageAttachments } from './message-attachments';
import { NotesReadLine } from './notes-read-line';
import { ReasoningBlock } from './reasoning-block';
import { Thinking } from './thinking';
import { ToolView, type ChatActions } from './tool-views';

type ChatMessageProps = {
	message: TutorUIMessage;
	// the reply that is still being written
	streaming: boolean;
	interactive: boolean;
	actions: ChatActions;
	topicName: (topicId: string | null | undefined) => string | undefined;
	model: AiModel | undefined;
	stopped: boolean;
	// only the last finished reply can be tried again
	onRetry?: () => void;
};

// a tool finished and the model is on its next step, which shows nothing until text arrives
function betweenSteps(message: TutorUIMessage): boolean {
	const last = message.parts.filter(({ type }) => type !== 'step-start').at(-1);
	return (
		last !== undefined &&
		isToolPart(last) &&
		'state' in last &&
		(last.state === 'output-available' || last.state === 'output-error')
	);
}

// which thinking part this is; the saved times are in the same order
const reasoningNumber = (message: TutorUIMessage, index: number) =>
	message.parts.slice(0, index).filter(({ type }) => type === 'reasoning')
		.length;

const studentText = (message: TutorUIMessage) =>
	message.parts
		.map((part) => (part.type === 'text' ? part.text : ''))
		.join('\n');

export function ChatMessage(props: ChatMessageProps) {
	return props.message.role === 'user' ? (
		<StudentMessage message={props.message} />
	) : (
		<OrbiMessage {...props} />
	);
}

function StudentMessage({ message }: { message: TutorUIMessage }) {
	return (
		<article className="flex flex-col items-end gap-1.5">
			<h3 className="sr-only">You said</h3>
			<p className="max-w-[85%] rounded-2xl rounded-br-md bg-muted px-4 py-2.5 text-[15px] leading-relaxed break-words whitespace-pre-wrap">
				{studentText(message)}
			</p>
			<MessageAttachments attachments={message.metadata?.attachments} />
		</article>
	);
}

function OrbiMessage({
	message,
	streaming,
	interactive,
	actions,
	topicName,
	model,
	stopped,
	onRetry,
}: ChatMessageProps) {
	const topic = topicName(message.metadata?.topicId);
	const text = message.parts
		.map((part) => (part.type === 'text' ? part.text : ''))
		.join('\n\n')
		.trim();

	return (
		<article className="flex gap-3">
			<OrbiMark className="mt-0.5 size-6" />
			<div className="flex min-w-0 flex-1 flex-col gap-3">
				<h3 className="sr-only">Orbi replied</h3>
				{topic && <NotesReadLine metadata={message.metadata} topic={topic} />}
				{message.parts.map((part, index) => {
					if (part.type === 'reasoning') {
						if (!part.text.trim()) return null;
						return (
							<ReasoningBlock
								key={index}
								text={part.text}
								thinking={streaming && part.state === 'streaming'}
								durationMs={
									message.metadata?.thinkingMs?.[
										reasoningNumber(message, index)
									]
								}
							/>
						);
					}
					if (part.type === 'text') {
						return (
							<Markdown
								key={index}
								text={part.text}
								streaming={streaming && index === message.parts.length - 1}
							/>
						);
					}
					if (isToolPart(part)) {
						if (isHiddenVisualError(message.parts, index)) return null;
						return (
							<ToolView
								key={index}
								part={part}
								interactive={interactive}
								actions={actions}
								onRetry={onRetry}
							/>
						);
					}
					return null;
				})}
				{streaming && betweenSteps(message) && (
					<Thinking label="Orbi is still writing…" />
				)}
				{stopped && (
					<p className="text-xs text-muted-foreground">
						You stopped this reply.
					</p>
				)}
				{!streaming && (
					<footer className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
						{text && <CopyButton text={text} />}
						{onRetry && (
							<button
								type="button"
								onClick={onRetry}
								className="flex items-center gap-1 rounded-md px-1.5 py-1 hover:bg-muted hover:text-foreground"
							>
								<RotateCcw className="size-3.5" />
								Try again
							</button>
						)}
						{model && <span className="px-1.5">{model.label}</span>}
					</footer>
				)}
			</div>
		</article>
	);
}
