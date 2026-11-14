import { describe, expect, it } from 'vitest';
import {
	TOUR_TARGETS,
	tourProgress,
	tourSteps,
	tourTargetSelector,
} from './steps';

describe('tour steps', () => {
	it('are a short tour of four to six steps', () => {
		expect(tourSteps.length).toBeGreaterThanOrEqual(4);
		expect(tourSteps.length).toBeLessThanOrEqual(6);
	});

	it('each point at a part of the page and say it in one or two sentences', () => {
		for (const step of tourSteps) {
			expect(step.targets.length).toBeGreaterThan(0);
			expect(
				step.targets.every((target) => TOUR_TARGETS.includes(target))
			).toBe(true);
			const sentences = step.body
				.split(/[.!?](\s|$)/)
				.filter((part) => part.trim());
			expect(sentences.length).toBeLessThanOrEqual(2);
		}
	});

	it('have their own ids', () => {
		const ids = tourSteps.map((step) => step.id);

		expect(new Set(ids).size).toBe(ids.length);
	});

	it('cover courses, notes, the chat and its model, and review', () => {
		expect(tourSteps.map((step) => step.id)).toEqual(
			expect.arrayContaining(['courses', 'notes', 'chat', 'model', 'review'])
		);
	});
});

describe('tourTargetSelector', () => {
	it('finds the marked part of the page', () => {
		expect(tourTargetSelector('add-notes')).toBe('[data-tour="add-notes"]');
	});
});

describe('tourProgress', () => {
	it('counts from one', () => {
		expect(tourProgress(0, 6)).toBe('1 of 6');
		expect(tourProgress(5, 6)).toBe('6 of 6');
	});
});
