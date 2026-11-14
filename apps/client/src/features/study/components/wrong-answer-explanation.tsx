'use client';

import { RotateCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUsageBlock } from '@/features/usage/hooks';
import { apiErrorMessage } from '@/lib/api';
import { useExplainAnswer } from '../hooks';

type WrongAnswerExplanationProps = {
	questionId: string;
	choice: number;
};

// After a wrong answer the student can ask Orbi why (US-07). It opens in place, under
// the feedback; Next question keeps the focus, so Enter still moves on. A failed
// request only shows a message here, and the session goes on.
export function WrongAnswerExplanation({
	questionId,
	choice,
}: WrongAnswerExplanationProps) {
	const explain = useExplainAnswer();
	const usageBlock = useUsageBlock();
	const ask = () => explain.mutate({ id: questionId, choice });

	if (explain.isIdle) {
		return (
			<div className="flex flex-col gap-1.5">
				<Button
					type="button"
					variant="outline"
					onClick={ask}
					disabled={usageBlock !== null}
					className="h-9 self-start rounded-full px-3.5 text-[13px]"
				>
					<Sparkles className="text-primary" />
					Explain my mistake
				</Button>
				{usageBlock && (
					<p className="text-xs text-muted-foreground">{usageBlock}</p>
				)}
			</div>
		);
	}

	if (explain.isError) {
		return (
			<div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
				<p role="alert" className="text-destructive">
					{apiErrorMessage(explain.error)}
				</p>
				<Button
					type="button"
					variant="ghost"
					onClick={ask}
					className="h-8 rounded-full px-3 text-[13px]"
				>
					<RotateCw />
					Try again
				</Button>
			</div>
		);
	}

	return (
		<section
			aria-label="Orbi's explanation"
			aria-busy={explain.isPending}
			className="rounded-xl border border-border bg-card px-4 py-3 text-sm"
		>
			<p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-primary">
				<Sparkles className="size-3.5" />
				Orbi explains
			</p>
			{explain.isPending ? (
				<div className="flex flex-col gap-2 py-1">
					<span className="sr-only">Orbi is writing an explanation.</span>
					<span className="h-3 w-full animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
					<span className="h-3 w-11/12 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
					<span className="h-3 w-2/3 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
				</div>
			) : (
				<p className="leading-relaxed whitespace-pre-line text-foreground">
					{explain.data?.text}
				</p>
			)}
		</section>
	);
}
