// the desktop sidebar remembers being collapsed in a cookie,
// so the server already draws it that way after a refresh
export const SIDEBAR_COOKIE = 'sidebar_collapsed';

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function isSidebarCollapsed(cookieValue: string | undefined): boolean {
	return cookieValue === 'true';
}

// browser only
export function saveSidebarCollapsed(collapsed: boolean): void {
	document.cookie = `${SIDEBAR_COOKIE}=${collapsed}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
}
