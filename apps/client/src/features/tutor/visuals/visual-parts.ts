import { isVisualToolName } from '@orbi/shared';
import type { TutorPart } from '../chat';

const visualState = (part: TutorPart) => {
	if (!part.type.startsWith('tool-')) return undefined;
	if (!isVisualToolName(part.type.slice('tool-'.length))) return undefined;
	return 'state' in part ? part.state : undefined;
};

// A visual the model got wrong is hidden once the same reply shows a visual that
// worked: the model fixes its mistake or stops at the limit, and the student
// should not see an error card above the visual they got.
export function isHiddenVisualError(
	parts: TutorPart[],
	index: number
): boolean {
	return (
		visualState(parts[index]!) === 'output-error' &&
		parts.some((part) => visualState(part) === 'output-available')
	);
}
