export function noteCountLabel(count: number): string {
	if (count === 0) return 'No notes yet';
	return count === 1 ? '1 note' : `${count} notes`;
}
