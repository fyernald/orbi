import 'server-only';

import { cookies } from 'next/headers';
import { isSidebarCollapsed, SIDEBAR_COOKIE } from './sidebar-state';

// whether the student left the desktop sidebar collapsed last time
export async function getSidebarCollapsed(): Promise<boolean> {
	return isSidebarCollapsed((await cookies()).get(SIDEBAR_COOKIE)?.value);
}
