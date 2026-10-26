import type { Mailer } from './mailer';

// for local runs: prints each email, so links like password reset still work without a mail server
export function createConsoleMailer(): Mailer {
	return {
		async send({ to, subject, text }) {
			console.info(`\n--- Email to ${to}: ${subject} ---\n${text}\n---\n`);
		},
	};
}
