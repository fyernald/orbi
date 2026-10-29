export type AttachmentKind = 'pdf' | 'image' | 'text' | 'document' | 'slides';

export type AttachmentStatus = 'uploading' | 'ready' | 'error';

export type Attachment = {
	id: string;
	file: File;
	kind: AttachmentKind | null;
	status: AttachmentStatus;
	// 0 to 1
	progress: number;
	error?: string;
};

// move these limits to packages/shared when the upload endpoint is built,
// so the server checks the same ones
export const maxAttachmentSize = 20 * 1024 * 1024;

const kindByExtension: Record<string, AttachmentKind> = {
	pdf: 'pdf',
	png: 'image',
	jpg: 'image',
	jpeg: 'image',
	webp: 'image',
	txt: 'text',
	md: 'text',
	doc: 'document',
	docx: 'document',
	ppt: 'slides',
	pptx: 'slides',
};

export const acceptedFileTypes = Object.keys(kindByExtension)
	.map((extension) => `.${extension}`)
	.join(',');

export const acceptedFilesHint =
	'PDF, images, text, Word or PowerPoint, up to 20 MB';

export const kindLabel: Record<AttachmentKind, string> = {
	pdf: 'PDF',
	image: 'Image',
	text: 'Text',
	document: 'Word',
	slides: 'Slides',
};

export const attachmentKind = (file: File): AttachmentKind | null =>
	kindByExtension[file.name.split('.').pop()?.toLowerCase() ?? ''] ?? null;

export function attachmentError(
	file: File,
	kind: AttachmentKind | null
): string | null {
	if (!kind) return 'Not supported';
	if (file.size === 0) return 'Empty file';
	if (file.size > maxAttachmentSize) return 'Over 20 MB';
	return null;
}

// for the tooltip and screen readers, since the chip only has room for the name
export function attachmentSummary({
	kind,
	file,
	status,
	progress,
	error,
}: Attachment) {
	if (status === 'error') return error ?? 'Could not attach';
	if (status === 'uploading') {
		return `Uploading, ${Math.round(progress * 100)}%`;
	}
	return kind
		? `${kindLabel[kind]} · ${formatFileSize(file.size)}`
		: formatFileSize(file.size);
}

export function formatFileSize(bytes: number) {
	if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
