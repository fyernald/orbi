import type { CourseGoal } from '@orbi/shared';
import {
	BookOpenCheck,
	Compass,
	GraduationCap,
	type LucideIcon,
} from 'lucide-react';

type GoalInfo = {
	label: string;
	// for course cards, where there is little room
	shortLabel: string;
	description: string;
	icon: LucideIcon;
};

export const goals: Record<CourseGoal, GoalInfo> = {
	exam_prep: {
		label: 'Prepare for an exam',
		shortLabel: 'Exam prep',
		description: 'Orbi plans your reviews around the exam date.',
		icon: GraduationCap,
	},
	keep_up: {
		label: 'Keep up with a class',
		shortLabel: 'Keeping up',
		description: 'Review each week what was covered in class.',
		icon: BookOpenCheck,
	},
	self_study: {
		label: 'Learn on my own',
		shortLabel: 'Self-study',
		description: 'Study at your own pace, with no deadline.',
		icon: Compass,
	},
};
