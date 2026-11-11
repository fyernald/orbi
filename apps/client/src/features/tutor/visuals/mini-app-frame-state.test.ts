import { describe, expect, it } from 'vitest';
import {
	FRAME_MAX_HEIGHT,
	FRAME_MIN_HEIGHT,
	frameHeight,
	frameReducer,
	initialFrameState,
	type FrameEvent,
	type FrameState,
} from './mini-app-frame-state';

const after = (...events: FrameEvent[]): FrameState =>
	events.reduce(frameReducer, initialFrameState);

const loaded: FrameEvent = { type: 'loaded' };
const ready: FrameEvent = { type: 'message', message: { type: 'ready' } };
const error = (message: string): FrameEvent => ({
	type: 'message',
	message: { type: 'error', message },
});

describe('frameReducer', () => {
	it('runs once the sandbox loaded and the app said it is ready', () => {
		expect(after(loaded).phase).toBe('starting');
		expect(after(loaded, ready).phase).toBe('running');
	});

	it('ignores messages before the code was sent', () => {
		expect(after(ready)).toEqual(initialFrameState);
	});

	it('takes the height the app asks for', () => {
		expect(
			after(loaded, ready, {
				type: 'message',
				message: { type: 'height', height: 320 },
			})
		).toMatchObject({ phase: 'running', height: 320 });
	});

	it('fails with the error when the app breaks while starting', () => {
		expect(after(loaded, error('draw is not defined'))).toEqual({
			phase: 'failed',
			failure: 'crashed',
			detail: 'draw is not defined',
		});
	});

	it('keeps a running app on screen after a later error, with a note', () => {
		expect(after(loaded, ready, error('bad click'))).toMatchObject({
			phase: 'running',
			lateError: 'bad click',
		});
	});

	it('closes an app that is slow to start, but not one that runs', () => {
		expect(after(loaded, { type: 'timeout' })).toEqual({
			phase: 'failed',
			failure: 'slow',
		});
		expect(after(loaded, ready, { type: 'timeout' }).phase).toBe('running');
	});

	it('closes an app that stops answering or loads another page', () => {
		expect(after(loaded, ready, { type: 'frozen' })).toEqual({
			phase: 'failed',
			failure: 'frozen',
		});
		expect(after(loaded, ready, loaded)).toEqual({
			phase: 'failed',
			failure: 'navigated',
		});
	});

	it('stays closed whatever comes after', () => {
		const closed = after(loaded, { type: 'frozen' });

		expect(frameReducer(closed, ready)).toBe(closed);
		expect(frameReducer(closed, loaded)).toBe(closed);
	});
});

describe('frameHeight', () => {
	it('keeps the frame between its smallest and largest height', () => {
		expect(frameHeight(10)).toBe(FRAME_MIN_HEIGHT);
		expect(frameHeight(300.4)).toBe(300);
		expect(frameHeight(5000)).toBe(FRAME_MAX_HEIGHT);
		expect(frameHeight(5000, 1200)).toBe(1200);
	});
});
