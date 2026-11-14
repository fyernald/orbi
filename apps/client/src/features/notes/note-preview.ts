export function isNotePreviewClipped(
	element: Pick<HTMLElement, 'scrollHeight' | 'clientHeight'>
): boolean {
	return element.scrollHeight > element.clientHeight;
}
