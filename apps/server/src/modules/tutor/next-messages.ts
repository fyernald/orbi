import {
	TUTOR_MESSAGE_MAX_LENGTH,
	type SendChatMessageInput,
	type TutorMessageMetadata,
} from '@orbi/shared';
import { ConflictError, ValidationError } from '../../errors';
import {
	messageText,
	skipUnansweredQuestions,
	studentMessageFrom,
	toStoredMessage,
	withStudentAnswers,
	type TutorUIMessage,
} from './messages';
import type { TutorRepository } from './repository';

// the messages the model sees, and the student's new message to save first
export async function nextMessages(
	repo: Pick<TutorRepository, 'deleteMessages' | 'saveMessage'>,
	userId: string,
	chatId: string,
	input: SendChatMessageInput,
	history: TutorUIMessage[],
	metadata: TutorMessageMetadata
): Promise<{ messages: TutorUIMessage[]; studentMessage?: TutorUIMessage }> {
	if (input.trigger === 'regenerate-message') {
		const lastStudent = history.map(({ role }) => role).lastIndexOf('user');
		if (lastStudent === -1) {
			throw new ValidationError('There is nothing to try again.');
		}
		const dropped = history.slice(lastStudent + 1).map(({ id }) => id);
		await repo.deleteMessages(userId, chatId, dropped);
		return { messages: history.slice(0, lastStudent + 1) };
	}

	const incoming = input.message!;
	if (incoming.role === 'assistant') {
		// the last reply comes back with the student's answer to askStudent
		const last = history.at(-1);
		if (!last || last.id !== incoming.id || last.role !== 'assistant') {
			throw new ValidationError('Only the last reply can go on.');
		}
		// only the answers come from the browser, the reply itself is the saved one
		const continued = withStudentAnswers(last, incoming);
		if (!continued) {
			throw new ConflictError('This question was already answered.');
		}
		return { messages: [...history.slice(0, -1), continued] };
	}

	const sentBefore = history.findIndex(({ id }) => id === incoming.id);
	if (sentBefore !== -1) {
		// the student's last message again, after a failed reply: try it again
		const lastStudent = history.map(({ role }) => role).lastIndexOf('user');
		if (sentBefore !== lastStudent) {
			throw new ConflictError('This message was already sent.');
		}
		const dropped = history.slice(sentBefore + 1).map(({ id }) => id);
		await repo.deleteMessages(userId, chatId, dropped);
		return { messages: history.slice(0, sentBefore + 1) };
	}
	const studentMessage = studentMessageFrom(incoming, metadata);
	const text = messageText(studentMessage);
	if (!text) throw new ValidationError('Write a message first.');
	if (text.length > TUTOR_MESSAGE_MAX_LENGTH) {
		throw new ValidationError(
			`Use at most ${TUTOR_MESSAGE_MAX_LENGTH.toLocaleString('en')} characters.`
		);
	}

	const last = history.at(-1);
	const skipped = last && skipUnansweredQuestions(last);
	if (skipped) {
		await repo.saveMessage(
			userId,
			chatId,
			toStoredMessage(skipped, new Date(metadata.createdAt))
		);
		history = [...history.slice(0, -1), skipped];
	}
	return { messages: [...history, studentMessage], studentMessage };
}
