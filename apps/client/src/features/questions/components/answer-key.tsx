import type { Question } from '@orbi/shared';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { choiceLetter } from '../choices';

type AnswerKeyProps = Pick<
	Question,
	'choices' | 'correctChoice' | 'explanation'
>;

// a question's options with the correct one marked, then why it is correct
export function AnswerKey({
	choices,
	correctChoice,
	explanation,
}: AnswerKeyProps) {
	return (
		<>
			<ul className="flex flex-col gap-1.5">
				{choices.map((choice, index) => {
					const correct = index === correctChoice;
					return (
						<li
							key={index}
							className={cn(
								'flex items-baseline gap-2.5 rounded-lg border px-3 py-2 text-sm',
								correct
									? 'border-tone-green-foreground/40 bg-tone-green text-tone-green-foreground'
									: 'border-border'
							)}
						>
							<span className="text-xs font-medium text-muted-foreground">
								{choiceLetter(index)}
							</span>
							<span className="min-w-0 flex-1 break-words">{choice}</span>
							{correct && (
								<>
									<Check className="size-4 shrink-0 self-center" />
									<span className="sr-only">(correct answer)</span>
								</>
							)}
						</li>
					);
				})}
			</ul>
			{explanation && (
				<p className="rounded-lg bg-muted px-3 py-2 text-sm text-subtle-foreground">
					{explanation}
				</p>
			)}
		</>
	);
}
