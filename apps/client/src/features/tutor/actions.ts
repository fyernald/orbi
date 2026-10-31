import type { TutorAction } from '@orbi/shared';
import {
	CircleHelp,
	ClipboardCheck,
	Layers,
	MessageCircle,
	type LucideIcon,
} from 'lucide-react';

// what the note composer does with the student's text and files
export type ComposerAction = {
	id: TutorAction;
	label: string;
	description: string;
	icon: LucideIcon;
	// the word between the action and the topic: "Ask Orbi about", "Flashcards from"
	joiner: string;
	fieldLabel: string;
	placeholder: string;
	submitLabel: string;
	// null when the action works without text or files
	emptyHint: string | null;
	note: string;
	// shown until the AI behind it is connected; such an action cannot be sent yet
	beta: boolean;
	// what the chat shows as the student's message when they send without writing one
	defaultMessage: ((topicName: string) => string) | null;
};

export const composerActions: Record<TutorAction, ComposerAction> = {
	ask: {
		id: 'ask',
		label: 'Ask Orbi',
		description: 'Chat with your tutor about the topic',
		icon: MessageCircle,
		joiner: 'about',
		fieldLabel: 'Your message',
		placeholder:
			'Ask anything about this topic, or paste notes to go through them together.',
		submitLabel: 'Send',
		emptyHint: 'Write a message first.',
		note: 'Orbi answers from your notes first and tells you when it goes beyond them.',
		beta: false,
		defaultMessage: null,
	},
	questions: {
		id: 'questions',
		label: 'Questions',
		description: 'Practice questions you approve one by one',
		icon: CircleHelp,
		joiner: 'from',
		fieldLabel: 'What to focus on',
		placeholder:
			'Optional: what to focus on, for example “only anaphase, 8 harder questions”.',
		submitLabel: 'Generate questions',
		emptyHint: null,
		note: 'Orbi writes questions only from your saved notes, and you approve each one.',
		beta: false,
		defaultMessage: (topicName) =>
			`Make practice questions from my notes on ${topicName}`,
	},
	flashcards: {
		id: 'flashcards',
		label: 'Flashcards',
		description: 'Key terms and definitions to memorize',
		icon: Layers,
		joiner: 'from',
		fieldLabel: 'Your notes',
		placeholder:
			'Paste your notes or drop files here. Orbi turns the key terms into flashcards.',
		submitLabel: 'Make flashcards',
		emptyHint: 'Add notes or attach a file first.',
		note: 'Flashcards come only from your notes, and you can edit each one.',
		beta: true,
		defaultMessage: (topicName) =>
			`Make flashcards from my notes on ${topicName}`,
	},
	mockExam: {
		id: 'mockExam',
		label: 'Mock exam',
		description: 'A timed test from your approved questions',
		icon: ClipboardCheck,
		joiner: 'on',
		fieldLabel: 'What to focus on',
		placeholder:
			'Optional: what to focus on, for example “only crossing over, 20 minutes”.',
		submitLabel: 'Start mock exam',
		emptyHint: null,
		note: 'The exam uses questions you already approved for this topic.',
		beta: true,
		defaultMessage: (topicName) => `Start a mock exam on ${topicName}`,
	},
};

// the order of the action menu
export const composerActionList = Object.values(composerActions);
