'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { redeemBetaKeyInput, type RedeemBetaKeyInput } from '@orbi/shared';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { FormError } from '@/components/form/form-error';
import { SubmitButton } from '@/components/form/submit-button';
import { TextField } from '@/components/form/text-field';
import { FieldGroup } from '@/components/ui/field';
import { authInput } from '@/features/auth/styles';
import { apiErrorMessage } from '@/lib/api';
import { routes } from '@/lib/routes';
import { useRedeemBetaKey } from '../hooks';

export function BetaKeyForm() {
	const router = useRouter();
	const redeem = useRedeemBetaKey();
	const form = useForm<RedeemBetaKeyInput>({
		resolver: zodResolver(redeemBetaKeyInput),
		defaultValues: { key: '' },
	});

	const onSubmit = (values: RedeemBetaKeyInput) =>
		redeem.mutate(values, {
			// the app's layout sends a new student on to the welcome questions
			onSuccess: () => router.replace(routes.app),
		});

	return (
		<form method="post" onSubmit={form.handleSubmit(onSubmit)} noValidate>
			<FieldGroup>
				<FormError message={apiErrorMessage(redeem.error)} />
				<TextField
					control={form.control}
					className={`${authInput} font-mono tracking-wider uppercase`}
					name="key"
					label="Beta key"
					placeholder="ORBI-XXXX-XXXX-XXXX"
					autoFocus
					autoComplete="off"
					autoCapitalize="characters"
					spellCheck={false}
				/>
				<SubmitButton pending={redeem.isPending || redeem.isSuccess}>
					Start studying
				</SubmitButton>
			</FieldGroup>
		</form>
	);
}
