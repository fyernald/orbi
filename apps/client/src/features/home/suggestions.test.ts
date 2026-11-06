import { describe, expect, it } from 'vitest';
import { routes } from '@/lib/routes';
import { suggestionsFor } from './suggestions';

describe('suggestionsFor', () => {
	it('shows nothing to a student who is caught up', () => {
		expect(suggestionsFor({ pendingApproval: 0 })).toEqual([]);
	});

	it('asks to approve new questions', () => {
		expect(suggestionsFor({ pendingApproval: 1 })).toEqual([
			{ label: 'Approve 1 new question', href: routes.review, tone: 'warning' },
		]);
		expect(suggestionsFor({ pendingApproval: 6 })[0]?.label).toBe(
			'Approve 6 new questions'
		);
	});
});
