'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { signInInput, type SignInInput } from '@orbi/shared';
import { useForm } from 'react-hook-form';
import { FormError } from '@/components/form/form-error';
import { SubmitButton } from '@/components/form/submit-button';
import { TextField } from '@/components/form/text-field';
import { FieldGroup } from '@/components/ui/field';
import { authErrorMessage } from '../errors';
import { useSignIn } from '../hooks';

export function SignInForm() {
	const signIn = useSignIn();
	const form = useForm<SignInInput>({
		resolver: zodResolver(signInInput),
		defaultValues: { email: '', password: '' },
	});

	return (
		<form
			onSubmit={form.handleSubmit((values) => signIn.mutate(values))}
			noValidate
		>
			<FieldGroup>
				<FormError message={authErrorMessage(signIn.error)} />
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
					autoComplete="current-password"
				/>
				<SubmitButton pending={signIn.isPending}>Log in</SubmitButton>
			</FieldGroup>
		</form>
	);
}
