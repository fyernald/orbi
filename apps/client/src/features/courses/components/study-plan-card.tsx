'use client';

import type { Course, Topic } from '@orbi/shared';
import { useEffect, useState } from 'react';
import { toIsoDate } from '@/lib/dates';
import {
	reconcileStudyPlan,
	topicsForDay,
	type StudyPlanState,
} from '../study-plan';

export function StudyPlanCard({
	course,
	topics,
}: {
	course: Course;
	topics?: Topic[];
}) {
	const [plan, setPlan] = useState<StudyPlanState | null>(null);
	const [loadedKey, setLoadedKey] = useState<string | null>(null);
	const today = toIsoDate(new Date());
	const key = `orbi:study-plan:${course.id}`;

	useEffect(() => {
		if (!course.examDate || !topics) return;
		let stored: StudyPlanState | null = null;
		try {
			const raw = localStorage.getItem(key);
			if (raw) stored = JSON.parse(raw) as StudyPlanState;
		} catch {
			/* invalid or unavailable browser storage */
		}
		const next = reconcileStudyPlan(stored, topics, course.examDate, today);
		setPlan(next);
		setLoadedKey(key);
		try {
			localStorage.setItem(key, JSON.stringify(next));
		} catch {
			/* storage unavailable */
		}
	}, [key, course.examDate, topics, today]);

	function toggle(topicId: string) {
		if (!plan) return;
		const next = {
			...plan,
			completed: { ...plan.completed, [topicId]: !plan.completed[topicId] },
		};
		setPlan(next);
		try {
			localStorage.setItem(key, JSON.stringify(next));
		} catch {
			/* storage unavailable */
		}
	}

	return (
		<section
			aria-labelledby="study-plan-heading"
			className="rounded-xl border border-border p-3"
		>
			<h3 id="study-plan-heading" className="text-sm font-semibold">
				Exam study plan
			</h3>
			{!course.examDate ? (
				<p className="mt-2 text-sm text-muted-foreground">
					Add an exam date to this course to create your study plan.
				</p>
			) : !topics ? (
				<p className="mt-2 text-sm text-muted-foreground">Loading topics…</p>
			) : topics.length === 0 ? (
				<p className="mt-2 text-sm text-muted-foreground">
					Add topics to this course to build your plan.
				</p>
			) : loadedKey !== key || !plan || plan.examDate !== course.examDate ? (
				<p className="mt-2 text-sm text-muted-foreground">
					Preparing your plan…
				</p>
			) : (
				<>
					<p className="mt-1 text-xs text-muted-foreground">
						Exam: {course.examDate} ·{' '}
						{topics.filter((t) => plan.completed[t.id]).length}/{topics.length}{' '}
						topics completed
					</p>
					<p className="mt-3 text-sm font-medium">Today's topics</p>
					{topicsForDay(topics, plan, today).length === 0 ? (
						<p className="mt-1 text-sm text-muted-foreground">
							Done for today! Check your upcoming topics below.
						</p>
					) : (
						<ul className="mt-2 space-y-2">
							{topicsForDay(topics, plan, today).map((topic) => (
								<li key={topic.id} className="flex items-start gap-2 text-sm">
									<input
										aria-label={`Complete ${topic.name}`}
										type="checkbox"
										className="mt-1"
										checked={false}
										onChange={() => toggle(topic.id)}
									/>
									<span>{topic.name}</span>
								</li>
							))}
						</ul>
					)}
					<p className="mt-3 text-xs text-muted-foreground">
						Upcoming:{' '}
						{
							topics.filter((t) => {
								const assignedDate = plan.assignments[t.id];
								return (
									!plan.completed[t.id] &&
									assignedDate !== undefined &&
									assignedDate > today
								);
							}).length
						}{' '}
						topics. Missed topics move to the next day.
					</p>
					<details className="mt-2 text-xs">
						<summary className="cursor-pointer">View full schedule</summary>
						<ul className="mt-2 space-y-1">
							{topics.map((t) => (
								<li key={t.id}>
									{plan.completed[t.id] ? '✓' : plan.assignments[t.id]} —{' '}
									{t.name}
								</li>
							))}
						</ul>
					</details>
					<p className="mt-2 text-xs text-muted-foreground">
						Progress is saved in this browser.
					</p>
				</>
			)}
		</section>
	);
}
