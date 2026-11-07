import * as Sentry from '@sentry/node';
import { loadSentryConfig } from './config';
import { sentryOptions } from './error-reporter';

// Loaded before the server with node --import (see the Dockerfile), so Sentry can trace
// the database before it is first imported. Same rule as index.ts: production with a DSN.
const sentry = loadSentryConfig();
if (sentry) Sentry.init(sentryOptions(sentry));
