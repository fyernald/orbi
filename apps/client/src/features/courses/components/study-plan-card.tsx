'use client';

import type { Course, Topic } from '@orbi/shared';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatShortDate } from '@/lib/dates';
import { examCountdown, upcomingExam } from '../exam-date';
import { ExamDateDialog } from './exam-date-dialog';
import { ExamDatePrompt } from './exam-date-prompt';
import { StudyPlanBody } from './study-plan-body';

type StudyPlanCardProps = {
	course: Course;
	topics?: Topic[];
};

// the topics to study each day until the exam (US-12)
export function StudyPlanCard({ course, topics }: StudyPlanCardProps) {
	const [editing, setEditing] = useState(false);
	const now = new Date();
	const examDate = upcomingExam(course, now);

	return (
		<section
			aria-labelledby="study-plan-title"
			className="flex flex-col gap-3 rounded-xl border border-border p-3"
		>
			<header className="flex items-start justify-between gap-2">
				<div className="flex flex-col gap-0.5">
					<h3 id="study-plan-title" className="text-sm font-semibold">
						Exam study plan
					</h3>
					{examDate && (
						<p className="text-xs text-muted-foreground">
							{examCountdown(examDate, now)} · {formatShortDate(examDate)}
						</p>
					)}
				</div>
				{examDate && (
					<Button variant="ghost" size="xs" onClick={() => setEditing(true)}>
						Change date
					</Button>
				)}
			</header>
			{!examDate ? (
				<ExamDatePrompt
					pastExamDate={course.examDate}
					onAdd={() => setEditing(true)}
				/>
			) : topics ? (
				<StudyPlanBody
					courseId={course.id}
					topics={topics}
					examDate={examDate}
					now={now}
				/>
			) : (
				<div
					aria-busy="true"
					aria-label="Loading the study plan"
					className="h-16 animate-pulse rounded-lg bg-muted"
				/>
			)}
			<ExamDateDialog
				course={course}
				open={editing}
				onOpenChange={setEditing}
			/>
		</section>
	);
}
