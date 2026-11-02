import type { SessionAnswer } from '@orbi/shared';
import { ArrowRight } from 'lucide-react';
import { KeyHint } from '@/components/key-hint';
import { Button } from '@/components/ui/button';
import { choiceLetter } from '@/features/questions/choices';
import { cn } from '@/lib/utils';

type AnswerFeedbackProps = {
	answer: SessionAnswer;
	isLast: boolean;
	onNext: () => void;
};

// right after each answer: was it right, the correct one if not, and why
export function AnswerFeedback({
	answer,
	isLast,
	onNext,
}: AnswerFeedbackProps) {
	return (
		<>
			<p
				className={cn(
					'rounded-xl px-4 py-3 text-sm',
					answer.correct
						? 'bg-tone-green text-tone-green-foreground'
						: 'bg-tone-red text-tone-red-foreground'
				)}
			>
				<span className="font-semibold">
					{answer.correct
						? 'Correct. '
						: `Not quite. The answer is ${choiceLetter(answer.correctChoice)}. `}
				</span>
				{answer.explanation}
			</p>
			<div className="flex items-center justify-end gap-3">
				<span className="hidden items-center gap-1.5 text-xs text-muted-foreground pointer-fine:flex">
					Press <KeyHint>Enter</KeyHint>
				</span>
				{/* takes the focus, so Enter moves on */}
				<Button autoFocus onClick={onNext} className="h-10 rounded-full px-5">
					{isLast ? 'See results' : 'Next question'}
					<ArrowRight />
				</Button>
			</div>
		</>
	);
}
