import { APP_NAME } from '@orbi/shared';

// every page's browser tab: "Courses · Orbi"; the root layout gives it to Next.js
export const TITLE_TEMPLATE = `%s · ${APP_NAME}`;

// the same title for a page that sets it itself, after its data loads
// (a function, so a $ in the name is not read as a replace pattern)
export const pageTitle = (name: string) =>
	TITLE_TEMPLATE.replace('%s', () => name);
