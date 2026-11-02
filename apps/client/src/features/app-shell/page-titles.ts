import { courseRoute, routes } from '@/lib/routes';
import { mainNav, miniApps } from './mock-data';

// the top bar names the page from the same labels as the sidebar
const titles: Record<string, string> = {
	...Object.fromEntries(
		[...mainNav, ...miniApps].map(({ href, label }) => [href, label])
	),
	[routes.newCourse]: 'New course',
	[routes.review]: 'Review questions',
	[routes.studySession]: 'Study session',
	[routes.settings]: 'Settings',
};

// a page deeper than these (a course, a topic) is named after its section
// until it gets a breadcrumb
export function pageTitleFor(pathname: string): string | null {
	if (titles[pathname]) return titles[pathname];
	const section = Object.keys(titles).find(
		(href) => href !== routes.app && pathname.startsWith(`${href}/`)
	);
	return section ? titles[section]! : null;
}

export type Crumb = { label: string; href?: string };

const coursePage = /^\/app\/courses\/([^/]+)$/;
const topicStudyPage = /^\/app\/courses\/([^/]+)\/topics\/[^/]+\/study$/;

// the top bar trail: "Courses & notes › Biology 101" on a course, else the page title;
// courseName looks the name up in the loaded course list
export function breadcrumbFor(
	pathname: string,
	courseName: (courseId: string) => string | undefined
): Crumb[] {
	const studiedCourseId = pathname.match(topicStudyPage)?.[1];
	if (studiedCourseId) {
		return [
			{ label: titles[routes.courses]!, href: routes.courses },
			{
				label: courseName(studiedCourseId) ?? '',
				href: courseRoute(studiedCourseId),
			},
			{ label: titles[routes.studySession]! },
		];
	}
	const courseId = pathname.match(coursePage)?.[1];
	if (courseId) {
		return [
			{ label: titles[routes.courses]!, href: routes.courses },
			{
				label:
					pathname === routes.newCourse
						? titles[routes.newCourse]!
						: (courseName(courseId) ?? ''),
			},
		];
	}
	const title = pageTitleFor(pathname);
	return title ? [{ label: title }] : [];
}
