'use client';

import { PDF_MAX_SIZE_LABEL } from '@orbi/shared';
import { CircleCheck } from 'lucide-react';
import { FormError } from '@/components/form/form-error';
import { usePdfUpload } from '../use-pdf-upload';
import { PdfUploadProgress } from './pdf-upload-progress';
import { UploadPdfButton } from './upload-pdf-button';

type PdfUploadProps = {
	courseId: string;
	topicId: string;
};

// the other way to add notes: Orbi takes the text out of a PDF and saves it
export function PdfUpload({ courseId, topicId }: PdfUploadProps) {
	const { state, start, cancel } = usePdfUpload(courseId, topicId);

	return (
		<div className="flex flex-col gap-2 rounded-xl border border-dashed border-border px-3.5 py-3">
			{state.status === 'uploading' ? (
				<PdfUploadProgress
					fileName={state.fileName}
					progress={state.progress}
					onCancel={cancel}
				/>
			) : (
				<div className="flex items-center gap-3">
					<p className="min-w-0 flex-1 text-sm text-muted-foreground">
						Or upload a PDF, up to {PDF_MAX_SIZE_LABEL}. Orbi saves its text as
						notes.
					</p>
					<UploadPdfButton onFile={start} />
				</div>
			)}
			{state.status === 'error' && <FormError message={state.message} />}
			{state.status === 'saved' && (
				<p
					role="status"
					className="flex items-center gap-1.5 text-xs text-muted-foreground"
				>
					<CircleCheck className="size-3.5 text-primary" />
					{state.message}
				</p>
			)}
		</div>
	);
}
