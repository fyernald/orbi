import * as Sentry from '@sentry/nextjs';
import { sentryEnabled, sentryOptions } from '@/lib/monitoring';

// errors in the browser go to Sentry, in production only
if (sentryEnabled) Sentry.init(sentryOptions);
