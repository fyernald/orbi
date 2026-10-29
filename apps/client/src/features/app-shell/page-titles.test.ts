import { describe, expect, it } from 'vitest';
import { routes } from '@/lib/routes';
import { pageTitleFor } from './page-titles';

describe('pageTitleFor', () => {
	it('uses the sidebar labels', () => {
		expect(pageTitleFor(routes.app)).toBe('Home');
		expect(pageTitleFor(routes.mockExams)).toBe('Mock Exams');
	});

	it('names pages that are not in the sidebar', () => {
		expect(pageTitleFor(routes.settings)).toBe('Settings');
	});

	it('names a deeper page after its section', () => {
		expect(pageTitleFor(`${routes.courses}/some-course-id`)).toBe(
			'Courses & notes'
		);
	});

	it('shows nothing for unknown pages', () => {
		expect(pageTitleFor('/app/somewhere')).toBeNull();
	});
});
