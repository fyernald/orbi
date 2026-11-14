import { describe, expect, it } from 'vitest';
import {
	createNoteDrafts,
	editNoteDraftKey,
	newNoteDraftKey,
} from './note-drafts';

function memoryStorage() {
	const items = new Map<string, string>();
	return {
		items,
		getItem: (key: string) => items.get(key) ?? null,
		setItem: (key: string, value: string) => void items.set(key, value),
		removeItem: (key: string) => void items.delete(key),
	};
}

const key = newNoteDraftKey('t1');

describe('note drafts', () => {
	it('keep unsaved text until it is cleared', () => {
		const storage = memoryStorage();
		const drafts = createNoteDrafts(() => storage);

		drafts.save(key, { title: 'Mitosis', content: 'Prophase first' });
		expect(drafts.read(key)).toEqual({
			title: 'Mitosis',
			content: 'Prophase first',
		});
		expect(drafts.has(key)).toBe(true);

		drafts.clear(key);
		expect(drafts.read(key)).toBeUndefined();
	});

	it('drop a new note that is empty again', () => {
		const storage = memoryStorage();
		const drafts = createNoteDrafts(() => storage);

		drafts.save(key, { title: '', content: 'a' });
		drafts.save(key, { title: ' ', content: '\n' });

		expect(storage.items.size).toBe(0);
	});

	it('drop an edit that is back to the saved text', () => {
		const storage = memoryStorage();
		const drafts = createNoteDrafts(() => storage);
		const saved = { title: 'Mitosis', content: 'Prophase first' };
		const edit = editNoteDraftKey('n1');

		drafts.save(edit, { ...saved, content: 'Prophase, then metaphase' }, saved);
		expect(drafts.has(edit)).toBe(true);

		drafts.save(edit, saved, saved);
		expect(drafts.has(edit)).toBe(false);
	});

	it('keep each note apart', () => {
		const storage = memoryStorage();
		const drafts = createNoteDrafts(() => storage);

		drafts.save(newNoteDraftKey('t1'), { title: '', content: 'one' });
		drafts.save(newNoteDraftKey('t2'), { title: '', content: 'two' });
		drafts.clear(newNoteDraftKey('t1'));

		expect(drafts.read(newNoteDraftKey('t1'))).toBeUndefined();
		expect(drafts.read(newNoteDraftKey('t2'))?.content).toBe('two');
	});

	it('ignore text that is not a draft', () => {
		const storage = memoryStorage();
		const drafts = createNoteDrafts(() => storage);
		storage.setItem(`orbi.noteDraft.${key}`, '{not json');
		storage.setItem(`orbi.noteDraft.${newNoteDraftKey('t2')}`, '{"title":1}');

		expect(drafts.read(key)).toBeUndefined();
		expect(drafts.read(newNoteDraftKey('t2'))).toBeUndefined();
	});

	it('work without storage, and when it refuses', () => {
		const missing = createNoteDrafts(() => undefined);
		const refusing = createNoteDrafts(() => ({
			getItem: () => {
				throw new Error('blocked');
			},
			setItem: () => {
				throw new Error('full');
			},
			removeItem: () => {
				throw new Error('blocked');
			},
		}));

		for (const drafts of [missing, refusing]) {
			expect(() => drafts.save(key, { title: '', content: 'a' })).not.toThrow();
			expect(drafts.read(key)).toBeUndefined();
			expect(() => drafts.clear(key)).not.toThrow();
		}
	});
});
