import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { attachmentSummary, type Attachment } from '../attachments';
import { AttachmentStatus } from './attachment-status';
import { AttachmentTile } from './attachment-tile';
import { RemoveAttachmentButton } from './remove-attachment-button';

type AttachmentChipProps = {
	attachment: Attachment;
	onRemove: () => void;
};

// same height and shape as the topic picker, so they sit in one row
export function AttachmentChip({ attachment, onRemove }: AttachmentChipProps) {
	const { file, kind, status, progress } = attachment;

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<li
					data-status={status}
					className={cn(
						'group relative flex h-8 max-w-60 min-w-0 animate-in items-center gap-1.5 rounded-[10px] border bg-card pr-2.5 pl-1.5 text-[13px] duration-200 zoom-in-95 fade-in-0 data-[status=error]:pr-7 motion-reduce:animate-none pointer-coarse:pr-7',
						status === 'error' ? 'border-destructive/40' : 'border-border'
					)}
				>
					<AttachmentTile
						kind={kind}
						progress={status === 'uploading' ? progress : null}
					/>
					<span className="min-w-0 truncate font-medium">{file.name}</span>
					<AttachmentStatus attachment={attachment} />
					<RemoveAttachmentButton fileName={file.name} onRemove={onRemove} />
				</li>
			</TooltipTrigger>
			<TooltipContent sideOffset={6}>
				{file.name} · {attachmentSummary(attachment)}
			</TooltipContent>
		</Tooltip>
	);
}
