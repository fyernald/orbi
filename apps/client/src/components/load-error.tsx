import { Button } from '@/components/ui/button';
import { FormError } from '@/components/form/form-error';

type LoadErrorProps = {
	message?: string;
	onRetry: () => void;
};

export function LoadError({ message, onRetry }: LoadErrorProps) {
	return (
		<div className="flex flex-col items-start gap-3">
			<FormError message={message} />
			<Button variant="outline" onClick={onRetry} className="rounded-full">
				Try again
			</Button>
		</div>
	);
}
