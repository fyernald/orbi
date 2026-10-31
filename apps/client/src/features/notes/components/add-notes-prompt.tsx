import { NotebookPen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

type AddNotesPromptProps = {
	topicName: string;
	onAddNotes: () => void;
};

// shown for a topic without notes, since the tutor and the questions need them
export function AddNotesPrompt({ topicName, onAddNotes }: AddNotesPromptProps) {
	return (
		<div className="flex items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3.5">
			<span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
				<NotebookPen className="size-4" />
			</span>
			<p className="min-w-0 flex-1 text-sm text-muted-foreground">
				Add your notes for{' '}
				<span className="font-medium text-foreground">{topicName}</span> so Orbi
				can make questions from them.
			</p>
			<Button
				variant="outline"
				onClick={onAddNotes}
				className="h-8 shrink-0 rounded-lg px-3"
			>
				<Plus />
				Add notes
			</Button>
		</div>
	);
}
