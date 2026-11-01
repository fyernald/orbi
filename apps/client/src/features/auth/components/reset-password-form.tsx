'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
	PASSWORD_MIN_LENGTH,
	resetPasswordInput,
	type ResetPasswordInput,
} from '@orbi/shared';
import { CircleCheckIcon } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { FormError } from '@/components/form/form-error';
import { SubmitButton } from '@/components/form/submit-button';
import { PasswordField } from '@/components/form/password-field';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { routes } from '@/lib/routes';
import { authErrorMessage } from '../errors';
import { authButton, authInput } from '../styles';
import { useResetPassword } from '../hooks';
import { AuthNotice } from './auth-notice';

export function ResetPasswordForm({ token }: { token: string }) {
	const resetPassword = useResetPassword(token);
	const form = useForm<ResetPasswordInput>({
		resolver: zodResolver(resetPasswordInput),
		defaultValues: { newPassword: '' },
	});

	if (resetPassword.isSuccess) {
		return (
			<AuthNotice
				icon={CircleCheckIcon}
				title="Your password is changed"
				action={
					<Button asChild className={authButton}>
						<Link href={routes.login}>Log in</Link>
					</Button>
				}
			>
				For your safety we logged you out on every device. Log in with your new
				password.
			</AuthNotice>
		);
	}

	return (
		<form
			// if it is sent before the page script runs, the password goes in the body, not the address
			method="post"
			onSubmit={form.handleSubmit((values) => resetPassword.mutate(values))}
			noValidate
		>
			<FieldGroup>
				<FormError message={authErrorMessage(resetPassword.error)} />
				<PasswordField
					control={form.control}
					className={authInput}
					name="newPassword"
					label="New password"
					autoFocus
					autoComplete="new-password"
					placeholder={`At least ${PASSWORD_MIN_LENGTH} characters`}
				/>
				<SubmitButton pending={resetPassword.isPending}>
					Change password
				</SubmitButton>
			</FieldGroup>
		</form>
	);
}
