import { describe, expect, it } from 'vitest';
import { scrollEdges } from './scroll-edges';

describe('scrollEdges', () => {
	it('has nothing to show when everything fits', () => {
		expect(
			scrollEdges({ scrollTop: 0, clientHeight: 300, scrollHeight: 300 })
		).toEqual({ above: false, below: false });
	});

	it('has more below at the top of a long list', () => {
		expect(
			scrollEdges({ scrollTop: 0, clientHeight: 300, scrollHeight: 900 })
		).toEqual({ above: false, below: true });
	});

	it('has more on both sides in the middle', () => {
		expect(
			scrollEdges({ scrollTop: 300, clientHeight: 300, scrollHeight: 900 })
		).toEqual({ above: true, below: true });
	});

	it('counts a pixel short of the end as the end', () => {
		expect(
			scrollEdges({ scrollTop: 599.5, clientHeight: 300, scrollHeight: 900 })
		).toEqual({ above: true, below: false });
	});
});
