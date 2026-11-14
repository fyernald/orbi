import { createHash, randomInt } from 'node:crypto';

// no 0, O, 1 or I, which look alike when typed from a message
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const GROUPS = 3;
const GROUP_LENGTH = 4;
const PREFIX = 'ORBI';

// a random key like ORBI-7KQ2-M9XD-R4TW, about 60 bits, too many to guess
export function createBetaKey(): string {
	const groups = Array.from({ length: GROUPS }, () =>
		Array.from(
			{ length: GROUP_LENGTH },
			() => ALPHABET[randomInt(ALPHABET.length)]
		).join('')
	);
	return [PREFIX, ...groups].join('-');
}

// The part that makes a key unique, however it was typed: with or without dashes,
// spaces, small letters or the ORBI prefix. Null when it cannot be one of our keys.
export function normalizeBetaKey(typed: string): string | null {
	let key = typed.toUpperCase().replace(/[\s-]/g, '');
	if (key.length === PREFIX.length + GROUPS * GROUP_LENGTH) {
		if (!key.startsWith(PREFIX)) return null;
		key = key.slice(PREFIX.length);
	}
	if (key.length !== GROUPS * GROUP_LENGTH) return null;
	return [...key].every((char) => ALPHABET.includes(char)) ? key : null;
}

// Only this is saved. The keys are random and long, so a plain SHA-256 is enough:
// nobody can work back from it to a key.
export const hashBetaKey = (normalized: string) =>
	createHash('sha256').update(normalized).digest('hex');
