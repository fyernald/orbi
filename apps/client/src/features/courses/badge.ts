// the start of the first word, for example "Bio" for "Biology 101"
export function courseShortName(name: string): string {
	const firstWord = name.trim().split(/\s+/)[0] ?? '';
	const short = Array.from(firstWord).slice(0, 3).join('');
	return short.charAt(0).toUpperCase() + short.slice(1);
}
