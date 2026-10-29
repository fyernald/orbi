import { Spinner } from '@/components/ui/spinner';

export function ListLoader() {
	return (
		<div className="flex justify-center py-10">
			<Spinner className="size-5 text-muted-foreground" />
		</div>
	);
}
