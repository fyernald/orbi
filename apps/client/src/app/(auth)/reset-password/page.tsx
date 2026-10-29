import type { Metadata } from 'next';
import { AuthCard } from '@/features/auth/components/auth-card';
import { AuthSwitch } from '@/features/auth/components/auth-switch';
import { BrokenResetLink } from '@/features/auth/components/broken-reset-link';
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form';
import { routes } from '@/lib/routes';

export const metadata: Metadata = {
	title: 'Choose a new password',
	// the token is in the address, so it must not leak to other sites
	referrer: 'no-referrer',
};

type ResetPasswordPageProps = {
	// the server opens this page from the email link with ?token=, or ?error= when the link is broken
	searchParams: Promise<{ token?: string; error?: string }>;
};

export default async function ResetPasswordPage({
	searchParams,
}: ResetPasswordPageProps) {
	const { token, error } = await searchParams;

	return (
		<AuthCard
			title="Choose a new password"
			description="Pick a password you do not use anywhere else."
			footer={
				<AuthSwitch prompt="Remember it?" href={routes.login} label="Log in" />
			}
		>
			{token && !error ? (
				<ResetPasswordForm token={token} />
			) : (
				<BrokenResetLink />
			)}
		</AuthCard>
	);
}
