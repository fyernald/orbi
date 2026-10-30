import type {
	DailyMinutes,
	EducationLevel,
	ExplanationStyle,
	Locale,
	ProfileUse,
	StudyTime,
} from '@orbi/shared';
import {
	BookMarked,
	CalendarCheck,
	Compass,
	GraduationCap,
	Languages,
	Lightbulb,
	ListOrdered,
	Microscope,
	Moon,
	NotebookPen,
	School,
	Shapes,
	Sun,
	Sunrise,
	Sunset,
	Timer,
	Zap,
	type LucideIcon,
} from 'lucide-react';

export type ChoiceInfo = {
	label: string;
	description: string;
	icon: LucideIcon;
};

export const uses: Record<ProfileUse, ChoiceInfo> = {
	exam_prep: {
		label: 'Prepare for exams',
		description: 'Practice questions and countdowns to exam dates.',
		icon: GraduationCap,
	},
	keep_up: {
		label: 'Keep up with classes',
		description: 'Regular reviews so nothing piles up.',
		icon: CalendarCheck,
	},
	learn_new: {
		label: 'Learn something new',
		description: 'Study a topic outside school.',
		icon: Compass,
	},
	hard_topics: {
		label: 'Understand hard topics',
		description: 'Simpler explanations from the tutor.',
		icon: Lightbulb,
	},
	research: {
		label: 'Research',
		description: 'Summarise and question sources and papers.',
		icon: Microscope,
	},
	revise_notes: {
		label: 'Revise my notes',
		description: 'Turn notes into questions and flashcards.',
		icon: NotebookPen,
	},
};

export const educationLevels: Record<EducationLevel, ChoiceInfo> = {
	high_school: {
		label: 'High school',
		description: 'Including university entrance exams.',
		icon: School,
	},
	undergraduate: {
		label: 'University',
		description: 'A bachelor’s or associate degree.',
		icon: GraduationCap,
	},
	postgraduate: {
		label: 'Postgraduate',
		description: 'A master’s degree or a PhD.',
		icon: BookMarked,
	},
};

export const explanationStyles: Record<ExplanationStyle, ChoiceInfo> = {
	short: {
		label: 'Short and direct',
		description: 'Just the key point.',
		icon: Zap,
	},
	step_by_step: {
		label: 'Step by step',
		description: 'Walk me through it.',
		icon: ListOrdered,
	},
	examples: {
		label: 'With lots of examples',
		description: 'Show me how it works in practice.',
		icon: Shapes,
	},
};

export const dailyMinutes: Record<DailyMinutes, ChoiceInfo> = {
	10: { label: '10 minutes', description: 'A light daily habit.', icon: Timer },
	20: { label: '20 minutes', description: 'Steady progress.', icon: Timer },
	30: { label: '30 minutes', description: 'A serious routine.', icon: Timer },
	60: { label: 'An hour or more', description: 'Deep study.', icon: Timer },
};

export const studyTimes: Record<StudyTime, ChoiceInfo> = {
	morning: { label: 'Morning', description: '06:00 to 12:00', icon: Sunrise },
	afternoon: { label: 'Afternoon', description: '12:00 to 17:00', icon: Sun },
	evening: { label: 'Evening', description: '17:00 to 21:00', icon: Sunset },
	night: { label: 'Night', description: 'After 21:00', icon: Moon },
};

export const locales: Record<Locale, ChoiceInfo> = {
	en: {
		label: 'English',
		description: 'Questions and explanations in English.',
		icon: Languages,
	},
	tr: {
		label: 'Türkçe',
		description: 'Sorular ve açıklamalar Türkçe.',
		icon: Languages,
	},
};

// one tap fills them in; the student can still type their own
export const fieldSuggestions = [
	'Computer Engineering',
	'Medicine',
	'Law',
	'Business',
	'Psychology',
	'Architecture',
	'Mathematics',
	'Biology',
];

export const interestSuggestions = [
	'Football',
	'Music',
	'Gaming',
	'Space',
	'Movies',
	'Cooking',
	'Art',
	'Coding',
	'Travel',
	'Fitness',
	'Books',
	'History',
];
