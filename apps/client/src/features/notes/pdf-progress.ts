// what the PDF row shows while a file goes up and Orbi writes its key points
export type PdfJob =
	| { status: 'uploading'; fileName: string; progress: number }
	| { status: 'writing'; fileName: string; done: number; total: number };

export type PdfProgressView = {
	// the line next to the file name
	label: string;
	// 0 to 100, for the bar
	percent: number;
	// what a screen reader hears for the bar
	barLabel: string;
};

// a bar that has started never looks empty, so the student sees Orbi is on it
const MIN_WRITING_PERCENT = 5;

export function pdfProgressView(job: PdfJob): PdfProgressView {
	if (job.status === 'uploading') {
		const percent = Math.round(job.progress * 100);
		return {
			// once the whole file is sent, the server still reads the text
			label: percent < 100 ? `Uploading ${percent}%` : 'Reading the text…',
			percent,
			barLabel: `Uploading ${job.fileName}`,
		};
	}
	const part = Math.min(job.done + 1, job.total);
	return {
		label:
			job.total > 1
				? `Writing key points · part ${part} of ${job.total}`
				: 'Writing key points…',
		percent: Math.max(
			MIN_WRITING_PERCENT,
			Math.round((100 * job.done) / job.total)
		),
		barLabel: `Writing the key points of ${job.fileName}`,
	};
}
