'use client';

import type { SavedPdf } from '@orbi/shared';
import { FileText, X } from 'lucide-react';
import { FormError } from '@/components/form/form-error';
import { Button } from '@/components/ui/button';
import { apiErrorMessage } from '@/lib/api';
import { useDeletePdf, useUnwrittenPdfs } from '../pdf-hooks';

type UnwrittenPdfsProps = {
	courseId: string;
	topicId: string;
	onWrite: (pdf: SavedPdf) => void;
};

// PDFs Orbi has read on the topic without notes yet: sent in the chat, or their
// key points were cancelled. The student can have them written, or remove them.
export function UnwrittenPdfs({
	courseId,
	topicId,
	onWrite,
}: UnwrittenPdfsProps) {
	const pdfs = useUnwrittenPdfs(courseId, topicId);
	const remove = useDeletePdf(courseId, topicId);
	if (!pdfs.data?.length) return null;

	return (
		<div className="flex flex-col gap-1.5 border-t border-dashed border-border pt-2">
			<p className="text-xs text-muted-foreground">
				Orbi has read these, but they have no notes yet.
			</p>
			<ul className="flex flex-col gap-1.5">
				{pdfs.data.map((pdf) => (
					<li key={pdf.fileHash} className="flex items-center gap-2.5">
						<span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-tone-red text-tone-red-foreground">
							<FileText className="size-3.5" />
						</span>
						<span className="min-w-0 flex-1 truncate text-sm">{pdf.name}</span>
						<Button
							type="button"
							variant="outline"
							onClick={() => onWrite(pdf)}
							className="h-7 shrink-0 rounded-lg px-2.5 text-xs"
						>
							Write key points
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							aria-label={`Remove ${pdf.name}`}
							disabled={remove.isPending}
							onClick={() => remove.mutate(pdf.fileHash)}
							className="size-7 shrink-0 rounded-lg"
						>
							<X className="size-3.5" />
						</Button>
					</li>
				))}
			</ul>
			{remove.isError && <FormError message={apiErrorMessage(remove.error)} />}
		</div>
	);
}
