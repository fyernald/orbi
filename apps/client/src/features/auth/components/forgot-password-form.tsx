'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { emailInput, type EmailInput } from '@orbi/shared';
import { MailCheckIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { FormError } from '@/components/form/form-error';
import { SubmitButton } from '@/components/form/submit-button';
import { TextField } from '@/components/form/text-field';
import { FieldGroup } from '@/components/ui/field';
import { authErrorMessage } from '../errors';
import { useRequestPasswordReset } from '../hooks';
import { AuthNotice } from './auth-notice';

export function ForgotPasswordForm() {
	const requestReset = useRequestPasswordReset();
	const form = useForm<EmailInput>({
		resolver: zodResolver(emailInput),
		defaultValues: { email: '' },
	});

	// the same answer for every email, so nobody can find out who has an account
	if (requestReset.isSuccess) {
		return (
			<AuthNotice icon={MailCheckIcon} title="Check your email">
				If{' '}
				<span className="font-medium text-foreground">
					{requestReset.variables.email}
				</span>{' '}
				has an Orbi account, we sent it a link to choose a new password.
			</AuthNotice>
		);
	}

	return (
		<form
			onSubmit={form.handleSubmit((values) => requestReset.mutate(values))}
			noValidate
		>
			<FieldGroup>
				<FormError message={authErrorMessage(requestReset.error)} />
				<TextField
					control={form.control}
					name="email"
					label="Email"
					autoFocus
					type="email"
					autoComplete="email"
				/>
				<SubmitButton pending={requestReset.isPending}>
					Send the link
				</SubmitButton>
			</FieldGroup>
		</form>
	);
}
