import type { MessageAttachment } from '@orbi/shared';
import { FileText } from 'lucide-react';

// the PDFs sent with a student's message, as small pills under it
export function MessageAttachments({
	attachments,
}: {
	attachments: MessageAttachment[] | undefined;
}) {
	if (!attachments?.length) return null;

	return (
		<ul
			role="list"
			aria-label="Attached files"
			className="flex max-w-[85%] flex-wrap justify-end gap-1.5"
		>
			{attachments.map(({ fileName, noteIds }) => (
				<li
					key={noteIds[0]}
					title={`${fileName}, read by Orbi`}
					className="flex h-7 max-w-60 min-w-0 items-center gap-1.5 rounded-full border border-border bg-card pr-3 pl-1.5 text-xs"
				>
					<span
						aria-hidden="true"
						className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-tone-red text-tone-red-foreground"
					>
						<FileText className="size-2.5" strokeWidth={2.25} />
					</span>
					<span className="min-w-0 truncate font-medium">{fileName}</span>
				</li>
			))}
		</ul>
	);
}
