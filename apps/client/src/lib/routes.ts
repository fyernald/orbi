// every page path in one place, so links and redirects never drift apart
// (the server's auth emails link to login and forgotPassword, keep them in sync)
export const routes = {
	landing: '/',
	login: '/login',
	signup: '/signup',
	forgotPassword: '/forgot-password',
	resetPassword: '/reset-password',
	app: '/app',
	courses: '/app/courses',
	progress: '/app/progress',
	review: '/app/review',
	studySession: '/app/session',
	mockExams: '/app/mock-exams',
	studyRooms: '/app/study-rooms',
	studyPlan: '/app/study-plan',
	settings: '/app/settings',
} as const;
