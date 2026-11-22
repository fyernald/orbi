import type { TipId } from '@orbi/shared';
import { z } from 'zod';
import { courseRoute, routes } from '@/lib/routes';

// what the cat knows about the page when it picks a tip
export type TipContext = {
	page: TipPage;
	// null until the courses have loaded
	courseCount: number | null;
	// on a course page, once its topics have loaded
	course?: {
		id: string;
		topicCount: number;
		noteCount: number;
		firstTopicId: string | null;
	};
	// the topic whose chat or notes are open
	topic?: { id: string; noteCount: number };
	notesOpen: boolean;
};

export type TipPage =
	| { kind: 'course'; courseId: string }
	| { kind: 'new-course' }
	| { kind: 'other' };

export type Tip = {
	id: TipId;
	text: string;
	action?: { label: string; href: string };
};

type TipRule = {
	id: TipId;
	when: (context: TipContext) => boolean;
	tip: (context: TipContext) => Omit<Tip, 'id'>;
};

// In the order a new student meets them; the first that fits and was not
// closed is the one the cat gives
const TIP_RULES: readonly TipRule[] = [
	{
		id: 'first-course',
		when: ({ page, courseCount }) =>
			courseCount === 0 && page.kind !== 'new-course',
		tip: () => ({
			text: 'Make your first course to get started. One for each class works well.',
			action: { label: 'New course', href: routes.newCourse },
		}),
	},
	{
		id: 'first-topic',
		when: ({ course }) => course?.topicCount === 0,
		tip: () => ({
			text: 'Add a topic for each chapter or lecture. Its notes and chats stay together.',
		}),
	},
	{
		id: 'first-notes',
		when: ({ course, notesOpen }) =>
			!notesOpen && !!course?.firstTopicId && course.noteCount === 0,
		tip: ({ course, topic }) => {
			const topicId = topic?.id ?? course!.firstTopicId!;
			return {
				text: 'Upload a PDF or type your notes to start. Orbi answers from them.',
				action: {
					label: 'Add notes',
					href: courseRoute(course!.id, { topic: topicId, notes: topicId }),
				},
			};
		},
	},
	{
		id: 'ask-about-notes',
		when: ({ topic, notesOpen }) => !notesOpen && (topic?.noteCount ?? 0) > 0,
		tip: () => ({
			text: 'Ask anything about this topic. Orbi answers from your notes and says when it goes beyond them.',
		}),
	},
];

export function pickTip(
	context: TipContext,
	dismissed: readonly string[]
): Tip | null {
	const rule = TIP_RULES.find(
		({ id, when }) => !dismissed.includes(id) && when(context)
	);
	return rule ? { id: rule.id, ...rule.tip(context) } : null;
}

const courseId = z.uuid();

// which page the cat is on, from its path
export function tipPage(pathname: string): TipPage {
	if (pathname === routes.newCourse) return { kind: 'new-course' };
	const [, id, ...rest] = pathname.slice(routes.courses.length).split('/') as [
		string,
		string?,
		...string[],
	];
	if (
		pathname.startsWith(`${routes.courses}/`) &&
		rest.length === 0 &&
		courseId.safeParse(id).success
	) {
		return { kind: 'course', courseId: id! };
	}
	return { kind: 'other' };
}
