import { CircleAlertIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// an error for the whole form, for example from the server
export function FormError({ message }: { message?: string }) {
	if (!message) return null;

	return (
		<Alert variant="destructive">
			<CircleAlertIcon />
			<AlertDescription>{message}</AlertDescription>
		</Alert>
	);
}
