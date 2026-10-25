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
import { TextField } from '@/components/form/text-field';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { routes } from '@/lib/routes';
import { authErrorMessage } from '../errors';
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
					<Button asChild className="w-full">
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
			onSubmit={form.handleSubmit((values) => resetPassword.mutate(values))}
			noValidate
		>
			<FieldGroup>
				<FormError message={authErrorMessage(resetPassword.error)} />
				<TextField
					control={form.control}
					name="newPassword"
					label="New password"
					type="password"
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
