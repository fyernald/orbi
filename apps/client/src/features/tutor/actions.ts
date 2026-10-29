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
	// shown until the AI behind it is connected
	beta: boolean;
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
		emptyHint: 'Write a message or attach a file first.',
		note: 'Orbi answers from your notes first and tells you when it goes beyond them.',
		beta: true,
	},
	questions: {
		id: 'questions',
		label: 'Questions',
		description: 'Practice questions you approve one by one',
		icon: CircleHelp,
		joiner: 'from',
		fieldLabel: 'Your notes',
		placeholder:
			'Paste your notes or drop files here. Orbi turns them into practice questions.',
		submitLabel: 'Generate questions',
		emptyHint: 'Add notes or attach a file first.',
		note: 'Orbi writes questions only from your notes, and you approve each one.',
		beta: false,
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
	},
};

// the order of the action menu
export const composerActionList = Object.values(composerActions);
