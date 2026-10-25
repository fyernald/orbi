import type { Metadata } from 'next';
import { AuthCard } from '@/features/auth/components/auth-card';
import { AuthSwitch } from '@/features/auth/components/auth-switch';
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';
import { routes } from '@/lib/routes';

export const metadata: Metadata = { title: 'Forgot password · Orbi' };

export default function ForgotPasswordPage() {
	return (
		<AuthCard
			title="Forgot your password?"
			description="Enter your email and we will send you a link to choose a new one."
			footer={
				<AuthSwitch prompt="Remember it?" href={routes.login} label="Log in" />
			}
		>
			<ForgotPasswordForm />
		</AuthCard>
	);
}
