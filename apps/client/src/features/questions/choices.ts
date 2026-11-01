const letters = ['A', 'B', 'C', 'D'];

// the letter a multiple-choice answer is shown with
export function choiceLetter(index: number): string {
	return letters[index] ?? String(index + 1);
}

// right: the correct answer once the question is answered; wrong: the student's wrong pick
export type ChoiceMark = 'right' | 'wrong';

// nothing is marked until there is an answer to check against
export function choiceMark(
	index: number,
	answer: { choice: number; correctChoice: number } | undefined
): ChoiceMark | undefined {
	if (!answer) return undefined;
	if (index === answer.correctChoice) return 'right';
	return index === answer.choice ? 'wrong' : undefined;
}
