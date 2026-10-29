import type { Attachment } from '../attachments';
import { AttachmentChip } from './attachment-chip';

type AttachmentListProps = {
	attachments: Attachment[];
	onRemove: (id: string) => void;
};

// display: contents puts the chips straight into the composer's top row, so they
// wrap next to the topic picker; role="list" keeps the list for screen readers
export function AttachmentList({ attachments, onRemove }: AttachmentListProps) {
	if (attachments.length === 0) return null;

	return (
		<ul role="list" aria-label="Attached files" className="contents">
			{attachments.map((attachment) => (
				<AttachmentChip
					key={attachment.id}
					attachment={attachment}
					onRemove={() => onRemove(attachment.id)}
				/>
			))}
		</ul>
	);
}
