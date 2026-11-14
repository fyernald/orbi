import * as Sentry from '@sentry/nextjs';
import { sentryEnabled, sentryOptions } from '@/lib/monitoring';

// errors while the Next.js server renders a page go to Sentry, in production only
export function register() {
	if (sentryEnabled && process.env.NEXT_RUNTIME === 'nodejs') {
		Sentry.init(sentryOptions);
	}
}

export const onRequestError = Sentry.captureRequestError;
