import { NotebookPen } from 'lucide-react';

export function NotesEmpty() {
	return (
		<div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-10 text-center">
			<span className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
				<NotebookPen className="size-5" />
			</span>
			<div className="flex flex-col gap-1">
				<p className="text-sm font-medium">No notes yet</p>
				<p className="max-w-xs text-sm text-muted-foreground">
					Paste your lecture notes or a summary above. Orbi makes practice
					questions from them.
				</p>
			</div>
		</div>
	);
}
