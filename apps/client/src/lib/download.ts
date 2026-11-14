const FILE_NAME_MAX_LENGTH = 60;

// one entry of a Download menu
export type DownloadOption = { label: string; save: () => void };

// a safe file name from a title: "Binary search tree (insert 7)" -> binary-search-tree-insert-7.svg
export function fileNameFor(title: string, extension: string): string {
	const base = title
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.slice(0, FILE_NAME_MAX_LENGTH)
		.replace(/^-+|-+$/g, '');
	return `${base || 'orbi'}.${extension}`;
}

// saves a file the page made, like a diagram, through the browser's download
export function downloadBlob(blob: Blob, fileName: string) {
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = fileName;
	link.click();
	setTimeout(() => URL.revokeObjectURL(url), 0);
}
