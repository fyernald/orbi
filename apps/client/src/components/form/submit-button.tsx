import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

type SubmitButtonProps = {
	pending: boolean;
	children: ReactNode;
};

// disabled with a spinner while the form is being sent, so it cannot be sent twice
export function SubmitButton({ pending, children }: SubmitButtonProps) {
	return (
		<Button
			type="submit"
			className="h-11 w-full rounded-full text-[15px]"
			disabled={pending}
		>
			{pending && <Spinner />}
			{children}
		</Button>
	);
}
