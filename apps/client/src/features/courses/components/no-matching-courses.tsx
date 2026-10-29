import { Button } from '@/components/ui/button';

export function NoMatchingCourses({ onClear }: { onClear: () => void }) {
	return (
		<div className="flex flex-col items-center gap-3 rounded-xl border border-border px-6 py-12 text-center">
			<p className="text-sm text-muted-foreground">
				No courses match your search.
			</p>
			<Button
				variant="outline"
				onClick={onClear}
				className="h-8 rounded-lg px-3"
			>
				Clear filters
			</Button>
		</div>
	);
}
