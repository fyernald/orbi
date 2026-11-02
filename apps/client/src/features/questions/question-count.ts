export function questionCountLabel(count: number): string {
	if (count === 0) return 'No questions yet';
	return count === 1 ? '1 question' : `${count} questions`;
}
