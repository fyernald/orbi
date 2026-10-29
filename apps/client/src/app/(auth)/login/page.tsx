import type { Metadata } from 'next';
import { AuthCard } from '@/features/auth/components/auth-card';
import { AuthSwitch } from '@/features/auth/components/auth-switch';
import { SignInForm } from '@/features/auth/components/sign-in-form';
import { brokenConfirmLinkMessage } from '@/features/auth/errors';
import { routes } from '@/lib/routes';

export const metadata: Metadata = { title: 'Log in' };

type LoginPageProps = {
	// set when a confirmation link did not work
	searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
	const { error } = await searchParams;

	return (
		<AuthCard
			title="Log in"
			description="Welcome back. Log in to continue studying."
			footer={
				<AuthSwitch
					prompt="No account yet?"
					href={routes.signup}
					label="Sign up"
				/>
			}
		>
			<SignInForm notice={error ? brokenConfirmLinkMessage : undefined} />
		</AuthCard>
	);
}
