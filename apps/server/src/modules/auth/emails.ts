import type { Email } from '../../mail/mailer';

type User = { name: string; email: string };

type Link = { label: string; url: string };

// the name comes from the user, so it is escaped before it goes into the HTML
function escapeHtml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

function buildEmail(
	user: User,
	subject: string,
	lines: string[],
	links: Link[]
): Email {
	const greeting = `Hi ${user.name},`;

	const text = [
		greeting,
		...lines,
		...links.map(({ label, url }) => `${label}: ${url}`),
		'The Orbi team',
	].join('\n\n');

	const html = [
		...[greeting, ...lines].map(escapeHtml),
		...links.map(
			({ label, url }) =>
				`<a href="${escapeHtml(url)}" style="font-weight:600">${escapeHtml(label)}</a>`
		),
		'The Orbi team',
	]
		.map((paragraph) => `<p>${paragraph}</p>`)
		.join('');

	return { to: user.email, subject, text, html };
}

export function verifyEmail(user: User, url: string) {
	return buildEmail(
		user,
		'Confirm your email for Orbi',
		[
			'Confirm your email address to start using Orbi. The link works for one hour.',
			'If you did not sign up for Orbi, you can ignore this email.',
		],
		[{ label: 'Confirm my email', url }]
	);
}

export function resetPasswordEmail(user: User, url: string) {
	return buildEmail(
		user,
		'Reset your Orbi password',
		[
			'Someone asked to reset the password of your Orbi account. The link works for one hour.',
			'If it was not you, ignore this email and your password stays the same.',
		],
		[{ label: 'Choose a new password', url }]
	);
}

// sent instead of an error, so the sign-up form never tells anyone which emails have an account
export function existingAccountEmail(user: User, appUrl: string) {
	return buildEmail(
		user,
		'You already have an Orbi account',
		[
			'Someone tried to sign up for Orbi with this email, but it already has an account.',
			'If it was not you, you can ignore this email. Nothing has changed.',
		],
		[
			// the same paths as routes in apps/client/src/lib/routes.ts
			{ label: 'Log in', url: `${appUrl}/login` },
			{ label: 'Forgot your password?', url: `${appUrl}/forgot-password` },
		]
	);
}
