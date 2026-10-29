import { routes } from '@/lib/routes';
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
