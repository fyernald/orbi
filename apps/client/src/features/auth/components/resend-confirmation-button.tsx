'use client';

import { FormError } from '@/components/form/form-error';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { authErrorMessage } from '../errors';
import { useResendConfirmation } from '../hooks';
import { authButton } from '../styles';

export function ResendConfirmationButton({ email }: { email: string }) {
	const resend = useResendConfirmation();

	return (
		<div className="flex w-full flex-col gap-3">
			<FormError message={authErrorMessage(resend.error)} />
			<Button
				variant="outline"
				className={authButton}
				disabled={resend.isPending || resend.isSuccess}
				onClick={() => resend.mutate({ email })}
			>
				{resend.isPending && <Spinner />}
				{resend.isSuccess ? 'Sent again' : 'Send the email again'}
			</Button>
		</div>
	);
}
