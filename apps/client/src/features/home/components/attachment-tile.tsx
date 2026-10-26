import {
	File,
	FileImage,
	FileText,
	FileType,
	NotepadText,
	Presentation,
	type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AttachmentKind } from '../attachments';
import { ProgressRing } from './progress-ring';

const looks: Record<AttachmentKind, { icon: LucideIcon; tone: string }> = {
	pdf: { icon: FileText, tone: 'bg-tone-red text-tone-red-foreground' },
	image: { icon: FileImage, tone: 'bg-tone-teal text-tone-teal-foreground' },
	text: { icon: NotepadText, tone: 'bg-secondary text-subtle-foreground' },
	document: { icon: FileType, tone: 'bg-tone-blue text-tone-blue-foreground' },
	slides: {
		icon: Presentation,
		tone: 'bg-tone-amber text-tone-amber-foreground',
	},
};

const unsupported = { icon: File, tone: 'bg-muted text-muted-foreground' };

type AttachmentTileProps = {
	kind: AttachmentKind | null;
	// set while the file uploads, then the file type icon takes its place
	progress: number | null;
};

export function AttachmentTile({ kind, progress }: AttachmentTileProps) {
	const { icon: Icon, tone } = kind ? looks[kind] : unsupported;

	return (
		<span
			aria-hidden="true"
			className={cn(
				'flex size-5 shrink-0 items-center justify-center rounded-md',
				tone
			)}
		>
			{progress === null ? (
				<Icon
					className="size-3 animate-in duration-200 zoom-in-50 fade-in-0 motion-reduce:animate-none"
					strokeWidth={2}
				/>
			) : (
				<ProgressRing progress={progress} className="size-3.5" />
			)}
		</span>
	);
}
