import { routes } from '@/lib/routes';
import { mainNav, miniApps } from './mock-data';

// the top bar names the page from the same labels as the sidebar;
// pages deeper than these (a course, a topic) will show a breadcrumb instead
const titles: Record<string, string> = {
	...Object.fromEntries(
		[...mainNav, ...miniApps].map(({ href, label }) => [href, label])
	),
	[routes.review]: 'Review questions',
	[routes.studySession]: 'Study session',
	[routes.settings]: 'Settings',
};

export const pageTitleFor = (pathname: string): string | null =>
	titles[pathname] ?? null;
