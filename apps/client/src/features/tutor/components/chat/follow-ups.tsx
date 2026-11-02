'use client';

import { useId } from 'react';
import { apiErrorMessage } from '@/lib/api';
import { useFollowUps } from '../../hooks';
import { FollowUpPill } from './follow-up-pill';
import { FollowUpsLoading } from './follow-ups-loading';
import { RefreshFollowUpsButton } from './refresh-follow-ups-button';

type FollowUpsProps = {
	chatId: string;
	// Orbi's latest reply
	messageId: string;
	// nothing new can be sent right now
	disabled: boolean;
	onAsk: (question: string) => void;
};

// a few questions under Orbi's latest reply; one click asks it
export function FollowUps({
	chatId,
	messageId,
	disabled,
	onAsk,
}: FollowUpsProps) {
	const headingId = useId();
	const { questions, isLoading, isRefreshing, error, refresh } = useFollowUps(
		chatId,
		messageId
	);
	// the model found nothing to go deeper into, for example after small talk
	if (!isLoading && !error && questions.length === 0) return null;

	return (
		<section
			aria-labelledby={headingId}
			aria-busy={isLoading || isRefreshing}
			className="flex flex-col gap-2 pl-9"
		>
			<div className="flex items-center gap-1">
				<h4
					id={headingId}
					className="text-xs font-medium text-muted-foreground"
				>
					Go deeper
				</h4>
				{!isLoading && (
					<RefreshFollowUpsButton
						refreshing={isRefreshing}
						disabled={disabled}
						onRefresh={refresh}
					/>
				)}
			</div>
			{error && !isRefreshing && (
				<p className="text-xs text-muted-foreground">
					{apiErrorMessage(error)}
				</p>
			)}
			{isLoading ? (
				<FollowUpsLoading />
			) : (
				<ul
					// new questions come in again after a refresh
					key={questions.join('|')}
					className="flex flex-col items-start gap-1.5"
				>
					{questions.map((question, index) => (
						<li key={question} className="flex max-w-full">
							<FollowUpPill
								question={question}
								disabled={disabled || isRefreshing}
								delayMs={index * 60}
								onAsk={onAsk}
							/>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
