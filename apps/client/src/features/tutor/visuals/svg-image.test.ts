import { describe, expect, it } from 'vitest';
import { svgSize } from './svg-image';

describe('svgSize', () => {
	it('reads the drawing size from the viewBox', () => {
		expect(
			svgSize(
				'<svg width="100%" viewBox="-8 -8 412.5 230" style="max-width: 412px">'
			)
		).toEqual({ width: 412.5, height: 230 });
	});

	it('has no size without a usable viewBox', () => {
		expect(svgSize('<svg width="100%">')).toBeUndefined();
		expect(svgSize('<svg viewBox="0 0 0 0">')).toBeUndefined();
	});
});
