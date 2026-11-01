'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
	PASSWORD_MIN_LENGTH,
	signUpInput,
	type SignUpInput,
} from '@orbi/shared';
import { useForm } from 'react-hook-form';
import { FormError } from '@/components/form/form-error';
import { SubmitButton } from '@/components/form/submit-button';
import { PasswordField } from '@/components/form/password-field';
import { TextField } from '@/components/form/text-field';
import { FieldGroup } from '@/components/ui/field';
import { authErrorMessage } from '../errors';
import { authInput } from '../styles';
import { useSignUp } from '../hooks';
import { CheckInbox } from './check-inbox';

export function SignUpForm() {
	const signUp = useSignUp();
	const form = useForm<SignUpInput>({
		resolver: zodResolver(signUpInput),
		defaultValues: { name: '', email: '', password: '' },
	});

	if (signUp.isSuccess && !signUp.data?.token) {
		return <CheckInbox email={signUp.variables.email} />;
	}

	return (
		<form
			// if it is sent before the page script runs, the password goes in the body, not the address
			method="post"
			onSubmit={form.handleSubmit((values) => signUp.mutate(values))}
			noValidate
		>
			<FieldGroup>
				<FormError message={authErrorMessage(signUp.error)} />
				<TextField
					control={form.control}
					className={authInput}
					name="name"
					label="Name"
					autoFocus
					autoComplete="name"
				/>
				<TextField
					control={form.control}
					className={authInput}
					name="email"
					label="Email"
					type="email"
					autoComplete="email"
				/>
				<PasswordField
					control={form.control}
					className={authInput}
					name="password"
					label="Password"
					autoComplete="new-password"
					placeholder={`At least ${PASSWORD_MIN_LENGTH} characters`}
				/>
				<SubmitButton pending={signUp.isPending}>Create account</SubmitButton>
			</FieldGroup>
		</form>
	);
}
