import { X } from 'lucide-react';

type RemoveAttachmentButtonProps = {
	fileName: string;
	onRemove: () => void;
};

// with a mouse it fades in over the end of the chip on hover or focus, so the
// chip keeps its width; on touch screens and on failed files (which must be
// removed before generating) it always shows and the chip leaves room for it
export function RemoveAttachmentButton({
	fileName,
	onRemove,
}: RemoveAttachmentButtonProps) {
	return (
		<button
			type="button"
			onClick={onRemove}
			aria-label={`Remove ${fileName}`}
			className="absolute top-1/2 right-1 flex size-5 -translate-y-1/2 items-center justify-center rounded-md bg-card text-muted-foreground shadow-[-6px_0_6px_var(--color-card)] transition-opacity duration-150 after:absolute after:-inset-1.5 hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none motion-reduce:transition-none pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:group-data-[status=error]:opacity-100 pointer-fine:focus-visible:opacity-100"
		>
			<X className="size-3.5" strokeWidth={2.25} />
		</button>
	);
}
