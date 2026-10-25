import { createTransport } from 'nodemailer';

export type Email = {
	to: string;
	subject: string;
	text: string;
	html: string;
};

export interface Mailer {
	send(email: Email): Promise<void>;
}

export type SmtpOptions = {
	host: string;
	port: number;
	from: string;
	user?: string;
	password?: string;
};

// Mailpit in development, the mail provider's SMTP server in production
export function createSmtpMailer({
	host,
	port,
	from,
	user,
	password,
}: SmtpOptions): Mailer {
	const transport = createTransport({
		host,
		port,
		// port 465 is TLS from the start, the others upgrade with STARTTLS
		secure: port === 465,
		auth: user ? { user, pass: password } : undefined,
	});

	return {
		async send(email) {
			await transport.sendMail({ from, ...email });
		},
	};
}
