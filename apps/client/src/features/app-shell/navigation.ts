import {
	BookOpen,
	CalendarDays,
	ChartColumn,
	ClipboardCheck,
	House,
	type LucideIcon,
} from 'lucide-react';
import { routes } from '@/lib/routes';
import type { Tone } from '@/lib/tones';

// the links in the sidebar; page titles are found from them too

export type NavLink = {
	label: string;
	href: string;
	icon: LucideIcon;
	// shown, but not built yet: the link is not clickable until it is
	soon?: boolean;
};

export type MiniApp = NavLink & {
	tone: Tone;
};

export const mainNav: NavLink[] = [
	{ label: 'Home', href: routes.app, icon: House },
	{ label: 'Courses & notes', href: routes.courses, icon: BookOpen },
	{ label: 'Progress', href: routes.progress, icon: ChartColumn, soon: true },
];

export const miniApps: MiniApp[] = [
	{
		label: 'Mock Exams',
		href: routes.mockExams,
		icon: ClipboardCheck,
		tone: 'teal',
		soon: true,
	},
	{
		label: 'Study Plan',
		href: routes.studyPlan,
		icon: CalendarDays,
		tone: 'green',
		soon: true,
	},
];
