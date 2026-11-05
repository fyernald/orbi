import { createHash } from 'node:crypto';

// true when the password is in a known data breach
export type BreachedPasswordCheck = (password: string) => Promise<boolean>;

const RANGE_URL = 'https://api.pwnedpasswords.com/range/';
const TIMEOUT_MS = 3_000;

// Have I Been Pwned's range search: only the first 5 characters of the password's
// SHA-1 leave the server, and the answer lists every breached hash with that start.
// When the service fails or is slow, the password is let through: signing up
// should not depend on another site being up.
export function createBreachedPasswordCheck({
	fetchRange = fetchPwnedRange,
	onError,
}: {
	fetchRange?: (prefix: string) => Promise<string>;
	onError: (error: unknown) => void;
}): BreachedPasswordCheck {
	return async (password) => {
		const hash = createHash('sha1')
			.update(password)
			.digest('hex')
			.toUpperCase();
		const prefix = hash.slice(0, 5);
		const suffix = hash.slice(5);
		try {
			const range = await fetchRange(prefix);
			return range.split('\n').some((line) => {
				const [rest, count] = line.trim().split(':');
				return rest === suffix && Number(count) > 0;
			});
		} catch (error) {
			onError(error);
			return false;
		}
	};
}

async function fetchPwnedRange(prefix: string): Promise<string> {
	const response = await fetch(`${RANGE_URL}${prefix}`, {
		// padding hides from the network how many matches came back
		headers: { 'Add-Padding': 'true', 'User-Agent': 'Orbi' },
		signal: AbortSignal.timeout(TIMEOUT_MS),
	});
	if (!response.ok) {
		throw new Error(`Pwned Passwords answered ${response.status}`);
	}
	return response.text();
}
