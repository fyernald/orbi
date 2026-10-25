import { MailCheckIcon } from 'lucide-react';
import { AuthNotice } from './auth-notice';
import { ResendConfirmationButton } from './resend-confirmation-button';

// shown after sign-up, the same whether the email was new or already had an account
export function CheckInbox({ email }: { email: string }) {
	return (
		<AuthNotice
			icon={MailCheckIcon}
			title="Check your email"
			action={<ResendConfirmationButton email={email} />}
		>
			We sent a link to{' '}
			<span className="font-medium text-foreground">{email}</span>. Open it to
			confirm your email and start using Orbi.
		</AuthNotice>
	);
}
