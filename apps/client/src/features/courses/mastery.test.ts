import { describe, expect, it } from 'vitest';
import {
	courseMastery,
	courseMasteryLabel,
	masteryLabel,
	startedLabel,
} from './mastery';

describe('masteryLabel', () => {
	it('says "Not started" before the first answer, not 0', () => {
		expect(masteryLabel(null)).toBe('Not started');
		expect(masteryLabel(0)).toBe('0% mastery');
		expect(masteryLabel(72)).toBe('72% mastery');
	});
});

describe('courseMasteryLabel', () => {
	it('names the course score', () => {
		expect(courseMasteryLabel(null)).toBe('Course not started');
		expect(courseMasteryLabel(34)).toBe('Course mastery 34%');
	});
});

describe('courseMastery', () => {
	it('is null until a topic is started', () => {
		expect(courseMastery([])).toBeNull();
		expect(courseMastery([null, null])).toBeNull();
	});

	it('counts a topic that is not started as 0', () => {
		expect(courseMastery([90, null, null])).toBe(30);
		expect(courseMastery([80, 61])).toBe(71);
	});

	it('is 0 when every answer so far was wrong', () => {
		expect(courseMastery([0, null])).toBe(0);
	});
});

describe('startedLabel', () => {
	it('counts the started topics', () => {
		expect(startedLabel([40, null, 70, null, null])).toBe(
			'2 of 5 topics started'
		);
		expect(startedLabel([55])).toBe('1 of 1 topic started');
	});
});
