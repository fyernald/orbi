import { attachmentSummary, type Attachment } from '../attachments';

// the short text after the file name: the percent while uploading, the reason
// when it failed; a finished file shows nothing, the tooltip has its type and size
export function AttachmentStatus({ attachment }: { attachment: Attachment }) {
	const { file, status, progress, error } = attachment;

	if (status === 'error') {
		return <span className="shrink-0 text-destructive">{error}</span>;
	}

	if (status === 'uploading') {
		const percent = Math.round(progress * 100);
		return (
			<span
				role="progressbar"
				aria-label={`Uploading ${file.name}`}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={percent}
				className="shrink-0 text-muted-foreground tabular-nums"
			>
				{percent}%
			</span>
		);
	}

	return <span className="sr-only">{attachmentSummary(attachment)}</span>;
}
