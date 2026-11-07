// every page path in one place, so links and redirects never drift apart
// (the server's auth emails link to login and forgotPassword, keep them in sync)
export const routes = {
	landing: '/',
	login: '/login',
	signup: '/signup',
	forgotPassword: '/forgot-password',
	resetPassword: '/reset-password',
	// the questions a new user answers before the app opens
	welcome: '/welcome',
	app: '/app',
	courses: '/app/courses',
	newCourse: '/app/courses/new',
	progress: '/app/progress',
	review: '/app/review',
	studySession: '/app/session',
	mockExams: '/app/mock-exams',
	studyPlan: '/app/study-plan',
	settings: '/app/settings',
} as const;

// tool and ask open the course's study space with that tutor action or question
// ready; topic opens that topic's chat, model and think set the message box
export function courseRoute(
	courseId: string,
	start: {
		tool?: string;
		ask?: string;
		topic?: string;
		model?: string;
		think?: boolean;
	} = {}
): string {
	const query = new URLSearchParams();
	if (start.tool) query.set('tool', start.tool);
	if (start.ask) query.set('ask', start.ask);
	if (start.topic) query.set('topic', start.topic);
	if (start.model) query.set('model', start.model);
	if (start.think) query.set('think', '1');
	const search = query.toString();
	return `${routes.courses}/${courseId}${search ? `?${search}` : ''}`;
}

// a study session with the approved questions of one topic
export function topicStudyRoute(courseId: string, topicId: string): string {
	return `${routes.courses}/${courseId}/topics/${topicId}/study`;
}
