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
import { TextField } from '@/components/form/text-field';
import { FieldGroup } from '@/components/ui/field';
import { authErrorMessage } from '../errors';
import { useSignUp } from '../hooks';
import { CheckInbox } from './check-inbox';

export function SignUpForm() {
	const signUp = useSignUp();
	const form = useForm<SignUpInput>({
		resolver: zodResolver(signUpInput),
		defaultValues: { name: '', email: '', password: '' },
	});

	if (signUp.isSuccess) return <CheckInbox email={signUp.variables.email} />;

	return (
		<form
			onSubmit={form.handleSubmit((values) => signUp.mutate(values))}
			noValidate
		>
			<FieldGroup>
				<FormError message={authErrorMessage(signUp.error)} />
				<TextField
					control={form.control}
					name="name"
					label="Name"
					autoComplete="name"
				/>
				<TextField
					control={form.control}
					name="email"
					label="Email"
					type="email"
					autoComplete="email"
				/>
				<TextField
					control={form.control}
					name="password"
					label="Password"
					type="password"
					autoComplete="new-password"
					placeholder={`At least ${PASSWORD_MIN_LENGTH} characters`}
				/>
				<SubmitButton pending={signUp.isPending}>Create account</SubmitButton>
			</FieldGroup>
		</form>
	);
}
