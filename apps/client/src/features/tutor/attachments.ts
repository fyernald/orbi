import {
	PDF_MAX_SIZE,
	PDF_MAX_SIZE_LABEL,
	type MessageAttachment,
} from '@orbi/shared';

export type AttachmentKind = 'pdf' | 'image' | 'text' | 'document' | 'slides';

export type AttachmentStatus = 'uploading' | 'ready' | 'error';

export type Attachment = {
	id: string;
	file: File;
	kind: AttachmentKind | null;
	status: AttachmentStatus;
	// 0 to 1
	progress: number;
	// a short reason for the chip, and the whole one for the tooltip
	error?: string;
	errorDetail?: string;
	// once saved: the notes the PDF became, and whether they were there already
	noteIds?: string[];
	reused?: boolean;
};

// the kinds Orbi can read; the others are known so they get an icon and a clear
// reason. A PDF is saved as notes of the topic
const readableKinds: AttachmentKind[] = ['pdf'];

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

export const acceptedFileTypes = Object.entries(kindByExtension)
	.filter(([, kind]) => readableKinds.includes(kind))
	.map(([extension]) => `.${extension}`)
	.join(',');

export const acceptedFilesHint = `PDF, up to ${PDF_MAX_SIZE_LABEL}. Orbi saves it to the topic's notes`;

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
	if (!readableKinds.includes(kind)) return 'Only PDFs for now';
	if (file.size === 0) return 'Empty file';
	if (file.size > PDF_MAX_SIZE) return `Over ${PDF_MAX_SIZE_LABEL}`;
	return null;
}

// a PDF is saved to one topic, so the whole-course chat needs one picked first
export const noTopicError = {
	error: 'Pick a topic',
	errorDetail: 'Pick a topic first. Orbi saves a PDF to one topic’s notes.',
};

// for the tooltip and screen readers, since the chip only has room for the name
export function attachmentSummary({
	kind,
	file,
	status,
	progress,
	error,
	errorDetail,
	reused,
}: Attachment) {
	if (status === 'error') return errorDetail ?? error ?? 'Could not attach';
	if (status === 'uploading') {
		return `Uploading, ${Math.round(progress * 100)}%`;
	}
	const size = formatFileSize(file.size);
	const saved = reused
		? "Already in the topic's notes"
		: "Saved to the topic's notes";
	return `${kind ? `${kindLabel[kind]} · ${size}` : size} · ${saved}`;
}

export function formatFileSize(bytes: number) {
	if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// what a message keeps of its saved files, so the chat shows them and the tutor
// reads their notes first
export const messageAttachments = (
	attachments: Attachment[]
): MessageAttachment[] =>
	attachments.flatMap(({ status, file, noteIds }) =>
		status === 'ready' && noteIds?.length
			? [{ fileName: file.name, noteIds }]
			: []
	);
