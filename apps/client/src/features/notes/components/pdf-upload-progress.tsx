import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

type PdfUploadProgressProps = {
	fileName: string;
	// 0 to 1
	progress: number;
	onCancel: () => void;
};

// once the whole file is sent, the server still reads the text, so the bar
// stays full and says so
export function PdfUploadProgress({
	fileName,
	progress,
	onCancel,
}: PdfUploadProgressProps) {
	const percent = Math.round(progress * 100);
	const label = percent < 100 ? `${percent}%` : 'Reading the text…';

	return (
		<div className="flex items-center gap-3">
			<span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-tone-red text-tone-red-foreground">
				<FileText className="size-4" />
			</span>
			<div className="flex min-w-0 flex-1 flex-col gap-1.5">
				<div className="flex items-baseline justify-between gap-3 text-sm">
					<span className="truncate font-medium">{fileName}</span>
					<span className="shrink-0 text-xs text-muted-foreground tabular-nums">
						{label}
					</span>
				</div>
				<div
					role="progressbar"
					aria-label={`Uploading ${fileName}`}
					aria-valuemin={0}
					aria-valuemax={100}
					aria-valuenow={percent}
					className="h-1.5 overflow-hidden rounded-full bg-muted"
				>
					<div
						className="h-full rounded-full bg-primary transition-[width] duration-200 motion-reduce:transition-none"
						style={{ width: `${percent}%` }}
					/>
				</div>
			</div>
			<Button
				type="button"
				variant="ghost"
				onClick={onCancel}
				className="h-8 shrink-0 rounded-lg px-3"
			>
				Cancel
			</Button>
		</div>
	);
}
