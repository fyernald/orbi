// the closed line of a thinking part, for example "Thought for 6s"
export function thinkingLabel(ms: number | undefined): string {
	// older replies and stopped thinking have no time
	if (!ms) return 'Thought process';
	const seconds = Math.round(ms / 1000);
	if (seconds < 1) return 'Thought for a moment';
	if (seconds < 60) return `Thought for ${seconds}s`;
	const minutes = Math.floor(seconds / 60);
	const rest = seconds % 60;
	return rest === 0
		? `Thought for ${minutes}m`
		: `Thought for ${minutes}m ${rest}s`;
}
