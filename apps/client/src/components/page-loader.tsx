import { Spinner } from '@/components/ui/spinner';

// shown while a page waits for data it needs before it can render
export function PageLoader() {
	return (
		<div className="flex min-h-svh items-center justify-center">
			<Spinner className="size-6 text-muted-foreground" />
		</div>
	);
}
