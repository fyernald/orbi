import { formatShortDate } from '@/lib/dates';
import type { StudyDay } from '../study-plan';

// the days after today, folded away until the student wants to see them
export function StudyPlanSchedule({ days }: { days: StudyDay[] }) {
	return (
		<details className="text-xs">
			<summary className="cursor-pointer text-muted-foreground hover:text-foreground">
				Coming days
			</summary>
			<ul className="mt-2 flex flex-col gap-1.5">
				{days.map((day) => (
					<li key={day.date} className="flex gap-2">
						<span className="w-20 shrink-0 text-muted-foreground">
							{formatShortDate(day.date)}
						</span>
						<span>{day.topics.map((topic) => topic.name).join(', ')}</span>
					</li>
				))}
			</ul>
		</details>
	);
}
