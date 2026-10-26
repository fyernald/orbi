import { CloudUpload } from 'lucide-react';
import { acceptedFilesHint } from '../attachments';

// pointer-events-none keeps the drag events on the composer underneath
export function DropOverlay() {
	return (
		<div
			aria-hidden="true"
			className="pointer-events-none absolute -inset-px z-10 flex animate-in flex-col items-center justify-center gap-2 rounded-[inherit] border-2 border-dashed border-primary bg-accent/95 px-4 text-center text-accent-foreground duration-150 fade-in-0 motion-reduce:animate-none"
		>
			<CloudUpload className="size-7 animate-in duration-200 slide-in-from-bottom-2 motion-reduce:animate-none" />
			<p className="text-sm font-medium">Drop files here to attach them</p>
			<p className="text-[13px] text-accent-foreground/80">
				{acceptedFilesHint}
			</p>
		</div>
	);
}
