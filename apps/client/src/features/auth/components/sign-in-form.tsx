'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { signInInput, type SignInInput } from '@orbi/shared';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { FormError } from '@/components/form/form-error';
import { SubmitButton } from '@/components/form/submit-button';
import { TextField } from '@/components/form/text-field';
import { FieldGroup } from '@/components/ui/field';
import { routes } from '@/lib/routes';
import { authErrorMessage } from '../errors';
import { useSignIn } from '../hooks';

export function SignInForm({ notice }: { notice?: string }) {
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
				<FormError message={authErrorMessage(signIn.error) ?? notice} />
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
				<Link
					href={routes.forgotPassword}
					className="-mt-3 self-end text-sm text-muted-foreground underline-offset-4 hover:underline"
				>
					Forgot your password?
				</Link>
				<SubmitButton pending={signIn.isPending}>Log in</SubmitButton>
			</FieldGroup>
		</form>
	);
}
