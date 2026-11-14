'use client';

import { useEffect, useRef, useState, type DragEvent } from 'react';

const hasFiles = (event: DragEvent | globalThis.DragEvent) =>
	event.dataTransfer?.types.includes('Files') ?? false;

// lets files be dropped on one element; a file dropped anywhere else on the page
// is ignored, instead of the browser opening it and leaving the page
export function useFileDrop(onFiles: (files: File[]) => void) {
	const [isDragging, setIsDragging] = useState(false);
	// dragenter and dragleave also fire for every child, so they are counted
	const depth = useRef(0);

	useEffect(() => {
		const ignore = (event: globalThis.DragEvent) => {
			if (hasFiles(event)) event.preventDefault();
		};
		window.addEventListener('dragover', ignore);
		window.addEventListener('drop', ignore);
		return () => {
			window.removeEventListener('dragover', ignore);
			window.removeEventListener('drop', ignore);
		};
	}, []);

	const stop = () => {
		depth.current = 0;
		setIsDragging(false);
	};

	const dropZoneProps = {
		onDragEnter: (event: DragEvent) => {
			if (!hasFiles(event)) return;
			event.preventDefault();
			depth.current += 1;
			setIsDragging(true);
		},
		onDragOver: (event: DragEvent) => {
			if (!hasFiles(event)) return;
			event.preventDefault();
			event.dataTransfer.dropEffect = 'copy';
		},
		onDragLeave: (event: DragEvent) => {
			if (!hasFiles(event)) return;
			depth.current -= 1;
			if (depth.current <= 0) stop();
		},
		onDrop: (event: DragEvent) => {
			if (!hasFiles(event)) return;
			event.preventDefault();
			stop();
			onFiles(Array.from(event.dataTransfer.files));
		},
	};

	return { isDragging, dropZoneProps };
}
