import { askOrbiRoute, routes, todayListRoute } from '@/lib/routes';

export type HelpTopic = {
	title: string;
	body: string;
	href: string;
	// what the link says
	link: string;
};

// the short help the cat's menu opens: the four things a new student does first
export const helpTopics: readonly HelpTopic[] = [
	{
		title: 'Start a course',
		body: 'Make a course for each class you take, then add its topics.',
		href: routes.newCourse,
		link: 'New course',
	},
	{
		title: 'Add your notes',
		body: 'Open a topic and press Notes to type notes or upload a PDF.',
		href: routes.courses,
		link: 'Your courses',
	},
	{
		title: 'Ask the tutor',
		body: 'Ask about any topic. Orbi answers from your notes.',
		href: askOrbiRoute,
		link: 'Ask Orbi',
	},
	{
		title: 'Practise what is due',
		body: "Today's list on Home has the questions to practise today.",
		href: todayListRoute,
		link: "Today's list",
	},
];
