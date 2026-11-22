import { describe, expect, it } from 'vitest';
import { pickTip, tipPage, type TipContext } from './tips';

const COURSE = '00000000-0000-4000-8000-000000000001';
const TOPIC = '00000000-0000-4000-8000-000000000002';

const onCoursePage = (
	course: Partial<NonNullable<TipContext['course']>>,
	extra: Partial<TipContext> = {}
): TipContext => ({
	page: { kind: 'course', courseId: COURSE },
	courseCount: 1,
	course: {
		id: COURSE,
		topicCount: 1,
		noteCount: 0,
		firstTopicId: TOPIC,
		...course,
	},
	notesOpen: false,
	...extra,
});

describe('pickTip', () => {
	it('asks a student without courses to make one', () => {
		const tip = pickTip(
			{ page: { kind: 'other' }, courseCount: 0, notesOpen: false },
			[]
		);

		expect(tip).toMatchObject({
			id: 'first-course',
			action: { label: 'New course', href: '/app/courses/new' },
		});
	});

	it('says nothing until the courses have loaded, or on the new course page', () => {
		expect(
			pickTip(
				{ page: { kind: 'other' }, courseCount: null, notesOpen: false },
				[]
			)
		).toBeNull();
		expect(
			pickTip(
				{ page: { kind: 'new-course' }, courseCount: 0, notesOpen: false },
				[]
			)
		).toBeNull();
	});

	it('asks for a topic in a course without one', () => {
		const tip = pickTip(
			onCoursePage({ topicCount: 0, firstTopicId: null }),
			[]
		);

		expect(tip?.id).toBe('first-topic');
	});

	it('points at the notes of the open topic when the course has none', () => {
		const other = '00000000-0000-4000-8000-000000000003';
		const tip = pickTip(
			onCoursePage({}, { topic: { id: other, noteCount: 0 } }),
			[]
		);

		expect(tip).toMatchObject({
			id: 'first-notes',
			action: {
				label: 'Add notes',
				href: `/app/courses/${COURSE}?topic=${other}&notes=${other}`,
			},
		});
	});

	it('uses the first topic when no topic is open', () => {
		const tip = pickTip(onCoursePage({}), []);

		expect(tip?.action?.href).toBe(
			`/app/courses/${COURSE}?topic=${TOPIC}&notes=${TOPIC}`
		);
	});

	it('suggests asking once the open topic has notes', () => {
		const tip = pickTip(
			onCoursePage({ noteCount: 2 }, { topic: { id: TOPIC, noteCount: 2 } }),
			[]
		);

		expect(tip?.id).toBe('ask-about-notes');
	});

	it('stays quiet about notes while the notes are open', () => {
		expect(pickTip(onCoursePage({}, { notesOpen: true }), [])).toBeNull();
	});

	it('never gives a tip again once it was closed', () => {
		const context: TipContext = {
			page: { kind: 'other' },
			courseCount: 0,
			notesOpen: false,
		};

		expect(pickTip(context, ['first-course'])).toBeNull();
	});

	it('moves on to the next tip that fits', () => {
		const tip = pickTip(
			onCoursePage({ noteCount: 0 }, { topic: { id: TOPIC, noteCount: 0 } }),
			['first-notes']
		);

		expect(tip).toBeNull();
	});
});

describe('tipPage', () => {
	it('knows a course page by its id', () => {
		expect(tipPage(`/app/courses/${COURSE}`)).toEqual({
			kind: 'course',
			courseId: COURSE,
		});
	});

	it('knows the new course page', () => {
		expect(tipPage('/app/courses/new')).toEqual({ kind: 'new-course' });
	});

	it('treats everything else as another page', () => {
		expect(tipPage('/app')).toEqual({ kind: 'other' });
		expect(tipPage('/app/courses')).toEqual({ kind: 'other' });
		expect(tipPage(`/app/courses/${COURSE}/topics/${TOPIC}/study`)).toEqual({
			kind: 'other',
		});
	});
});
