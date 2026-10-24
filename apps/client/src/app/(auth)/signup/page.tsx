import type { Metadata } from 'next';
import { AuthCard } from '@/features/auth/components/auth-card';
import { AuthSwitch } from '@/features/auth/components/auth-switch';
import { SignUpForm } from '@/features/auth/components/sign-up-form';
import { routes } from '@/lib/routes';

export const metadata: Metadata = { title: 'Sign up · Orbi' };

export default function SignUpPage() {
	return (
		<AuthCard
			title="Create your account"
			description="Save your courses, notes, and progress."
			footer={
				<AuthSwitch
					prompt="Already have an account?"
					href={routes.login}
					label="Log in"
				/>
			}
		>
			<SignUpForm />
		</AuthCard>
	);
}
