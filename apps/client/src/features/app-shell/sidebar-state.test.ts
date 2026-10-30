import { describe, expect, it } from 'vitest';
import { isSidebarCollapsed } from './sidebar-state';

describe('isSidebarCollapsed', () => {
	it.each([
		['true', true],
		['false', false],
		[undefined, false],
		['yes', false],
	])('%s is %s', (value, collapsed) => {
		expect(isSidebarCollapsed(value)).toBe(collapsed);
	});
});
