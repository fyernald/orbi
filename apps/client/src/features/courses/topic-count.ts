export function topicCountLabel(count: number): string {
	if (count === 0) return 'No topics yet';
	return count === 1 ? '1 topic' : `${count} topics`;
}
