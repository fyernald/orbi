'use client';

import { PDF_MAX_SIZE_LABEL } from '@orbi/shared';
import { CircleCheck } from 'lucide-react';
import { FormError } from '@/components/form/form-error';
import { ModelPicker } from '@/features/tutor/components/model-picker';
import { useModelChoice } from '@/features/tutor/use-model-choice';
import { usePdfUpload } from '../use-pdf-upload';
import { PdfUploadProgress } from './pdf-upload-progress';
import { UnwrittenPdfs } from './unwritten-pdfs';
import { UploadPdfButton } from './upload-pdf-button';

type PdfUploadProps = {
	courseId: string;
	topicId: string;
};

// The other way to add notes: Orbi reads a PDF and writes notes with its key
// points, with the model picked here (the student's default at first)
export function PdfUpload({ courseId, topicId }: PdfUploadProps) {
	const { state, start, write, cancel } = usePdfUpload(courseId, topicId);
	const { models, modelId, setModelId } = useModelChoice();
	const busy = state.status === 'uploading' || state.status === 'writing';

	return (
		<div className="flex flex-col gap-2 rounded-xl border border-dashed border-border px-3.5 py-3">
			{busy ? (
				<PdfUploadProgress job={state} onCancel={cancel} />
			) : (
				<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
					<p className="min-w-0 flex-1 basis-48 text-sm text-muted-foreground">
						Or upload a PDF, up to {PDF_MAX_SIZE_LABEL}. Orbi writes notes with
						its key points.
					</p>
					<div className="flex shrink-0 items-center gap-1">
						{models.length > 0 && (
							<ModelPicker
								models={models}
								selectedId={modelId}
								onSelect={setModelId}
							/>
						)}
						<UploadPdfButton onFile={(file) => start(file, modelId)} />
					</div>
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
			{!busy && (
				<UnwrittenPdfs
					courseId={courseId}
					topicId={topicId}
					onWrite={(pdf) => write(pdf, modelId)}
				/>
			)}
		</div>
	);
}
