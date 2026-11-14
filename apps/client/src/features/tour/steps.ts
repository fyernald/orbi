// The parts of the page a tour step can point at, marked with data-tour="..."
export const TOUR_TARGETS = [
	'courses',
	'add-notes',
	'composer',
	'model',
	'today',
	'review',
	'account',
	// the menu button on phones, where the sidebar is folded away
	'menu',
] as const;

export type TourTarget = (typeof TOUR_TARGETS)[number];

export type TourStep = {
	id: string;
	title: string;
	body: string;
	// the first one that shows on the page is pointed at; with none, the card
	// sits in the middle of the screen
	targets: TourTarget[];
};

// A short look at the main parts of Orbi, on Home, where a new student lands
export const tourSteps: TourStep[] = [
	{
		id: 'courses',
		title: 'Courses and topics',
		body: 'Add a course for each class. Its topics keep their own notes, chats and questions.',
		targets: ['courses', 'menu'],
	},
	{
		id: 'notes',
		title: 'Your notes',
		body: 'Paste notes into a topic, or upload a PDF and Orbi writes its key points for you.',
		targets: ['add-notes', 'menu'],
	},
	{
		id: 'chat',
		title: 'Ask Orbi',
		body: 'Ask about any course or topic here. Orbi answers from your notes first.',
		targets: ['composer'],
	},
	{
		id: 'model',
		title: 'Pick a model',
		body: 'Choose the AI model for each chat. Set the one new chats start on in Settings.',
		targets: ['model', 'composer'],
	},
	{
		id: 'review',
		title: 'Questions and review',
		body: 'Orbi makes practice questions from your notes. The ones to review today wait on Home.',
		targets: ['today', 'review', 'courses', 'menu'],
	},
	{
		id: 'replay',
		title: 'That is the tour',
		body: 'You can take it again any time from this menu or from Settings.',
		targets: ['account', 'menu'],
	},
];

// the selector of a target, for document.querySelector
export const tourTargetSelector = (target: TourTarget) =>
	`[data-tour="${target}"]`;

// "2 of 6", for the card and screen readers
export const tourProgress = (index: number, total: number) =>
	`${index + 1} of ${total}`;
