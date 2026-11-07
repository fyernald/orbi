import { describe, expect, it } from 'vitest';
import { mixHex } from './colors';

describe('mixHex', () => {
	it('lays a colour over the base at the given weight', () => {
		expect(mixHex('#c61d78', '#ffffff', 1)).toBe('#c61d78');
		expect(mixHex('#c61d78', '#ffffff', 0)).toBe('#ffffff');
		expect(mixHex('#000000', '#ffffff', 0.5)).toBe('#808080');
	});

	it('refuses anything but #rrggbb, which Mermaid could not tint', () => {
		expect(() => mixHex('oklch(0.6 0.2 0)', '#ffffff', 0.2)).toThrow();
	});
});
