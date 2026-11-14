import { FileText } from 'lucide-react';

// the PDF Orbi wrote the note from
export function NoteSource({ name }: { name: string }) {
	return (
		<p className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
			<FileText aria-hidden="true" className="size-3.5 shrink-0" />
			<span className="truncate">From {name}</span>
		</p>
	);
}
