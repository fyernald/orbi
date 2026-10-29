import { describe, expect, it } from 'vitest';
import { routes } from '@/lib/routes';
import { breadcrumbFor, pageTitleFor } from './page-titles';

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

describe('breadcrumbFor', () => {
	const names = (id: string) => (id === 'c1' ? 'Biology 101' : undefined);

	it('leads from the courses page to the course', () => {
		expect(breadcrumbFor(`${routes.courses}/c1`, names)).toEqual([
			{ label: 'Courses & notes', href: routes.courses },
			{ label: 'Biology 101' },
		]);
	});

	it('names the new course page', () => {
		expect(breadcrumbFor(routes.newCourse, names).at(-1)).toEqual({
			label: 'New course',
		});
	});

	it('shows the page title on other pages', () => {
		expect(breadcrumbFor(routes.progress, names)).toEqual([
			{ label: 'Progress' },
		]);
	});
});
