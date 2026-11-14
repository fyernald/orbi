import { z } from 'zod';

// Text typed in a note and not saved yet (T-42). It is kept for this tab, so
// going back to the chat, opening the notes again or a reload does not lose it.
// It goes when the note is saved, emptied, or its edit is cancelled.
type DraftStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const PREFIX = 'orbi.noteDraft.';

// any text, even past the limits: the form says what is wrong when it is saved
const noteDraft = z.object({ title: z.string(), content: z.string() });
export type NoteDraft = z.infer<typeof noteDraft>;

const EMPTY: NoteDraft = { title: '', content: '' };

export const newNoteDraftKey = (topicId: string) => `new:${topicId}`;
export const editNoteDraftKey = (noteId: string) => `edit:${noteId}`;

const sameText = (a: NoteDraft, b: NoteDraft) =>
	a.title.trim() === b.title.trim() && a.content.trim() === b.content.trim();

// The storage can be missing (on the server) or refuse (private windows, full
// storage); the notes then work as before, without keeping drafts.
export function createNoteDrafts(storage: () => DraftStorage | undefined) {
	const attempt = <T>(act: (store: DraftStorage) => T): T | undefined => {
		try {
			const store = storage();
			return store ? act(store) : undefined;
		} catch {
			return undefined;
		}
	};

	const read = (key: string): NoteDraft | undefined =>
		attempt((store) => {
			const raw = store.getItem(PREFIX + key);
			if (raw === null) return undefined;
			const parsed = noteDraft.safeParse(JSON.parse(raw));
			return parsed.success ? parsed.data : undefined;
		});

	const clear = (key: string) => {
		attempt((store) => store.removeItem(PREFIX + key));
	};

	// text the same as what is saved is no draft
	const save = (key: string, draft: NoteDraft, saved: NoteDraft = EMPTY) => {
		if (sameText(draft, saved)) clear(key);
		else attempt((store) => store.setItem(PREFIX + key, JSON.stringify(draft)));
	};

	return { read, save, clear, has: (key: string) => read(key) !== undefined };
}

export const noteDrafts = createNoteDrafts(() =>
	typeof window === 'undefined' ? undefined : window.sessionStorage
);
