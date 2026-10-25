import type { Email, Mailer } from './mailer';

// keeps every email in a list, so tests can read them and follow their links
export function createMemoryMailer(): Mailer & { sent: Email[] } {
	const sent: Email[] = [];
	return {
		sent,
		async send(email) {
			sent.push(email);
		},
	};
}
