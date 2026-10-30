import type { Profile } from '@orbi/shared';
import { describe, expect, it } from 'vitest';
import {
	firstOpenStep,
	isAnswered,
	onboardingSteps,
	toFormValues,
} from './steps';

const empty: Profile = {
	preferredName: null,
	birthDate: null,
	uses: [],
	educationLevel: null,
	fieldOfStudy: null,
	interests: [],
	explanationStyle: null,
	dailyMinutes: null,
	studyTime: null,
	locale: null,
	timezone: null,
	onboardedAt: null,
};

const stepOf = (id: string) =>
	onboardingSteps.findIndex((step) => step.id === id);

describe('firstOpenStep', () => {
	it('starts a new user on the welcome screen', () => {
		expect(firstOpenStep(onboardingSteps, empty)).toBe(0);
	});

	it('brings a returning user back to the first question without an answer', () => {
		const saved = {
			...empty,
			preferredName: 'Ada',
			birthDate: '2004-12-10',
			uses: ['research' as const],
			educationLevel: 'undergraduate' as const,
		};

		expect(firstOpenStep(onboardingSteps, saved)).toBe(stepOf('fieldOfStudy'));
	});

	it('stays on the last question when everything is answered', () => {
		const saved: Profile = {
			...empty,
			preferredName: 'Ada',
			birthDate: '2004-12-10',
			uses: ['research'],
			educationLevel: 'undergraduate',
			fieldOfStudy: 'Law',
			interests: ['Music'],
			explanationStyle: 'short',
			dailyMinutes: 20,
			studyTime: 'night',
			locale: 'en',
			timezone: 'Europe/Istanbul',
		};

		expect(firstOpenStep(onboardingSteps, saved)).toBe(
			onboardingSteps.length - 1
		);
	});
});

describe('isAnswered', () => {
	it('uses the same checks as the server', () => {
		expect(isAnswered(['uses'], { uses: [] })).toBe(false);
		expect(isAnswered(['uses'], { uses: ['research'] })).toBe(true);
		expect(isAnswered(['fieldOfStudy'], { fieldOfStudy: '  ' })).toBe(false);
		expect(isAnswered(['timezone'], { timezone: 'Mars/Olympus' })).toBe(false);
	});
});

describe('toFormValues', () => {
	it('leaves unanswered questions empty and starts the name from the account', () => {
		expect(toFormValues({ ...empty, locale: 'tr' }, 'Ada Lovelace')).toEqual({
			preferredName: 'Ada',
			fieldOfStudy: '',
			uses: [],
			interests: [],
			locale: 'tr',
		});
	});
});
