'use client';

import { FileUp } from 'lucide-react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';

export function UploadPdfButton({ onFile }: { onFile: (file: File) => void }) {
	const inputRef = useRef<HTMLInputElement>(null);

	return (
		<>
			<Button
				type="button"
				variant="outline"
				onClick={() => inputRef.current?.click()}
				className="h-8 shrink-0 rounded-lg px-3"
			>
				<FileUp />
				Upload PDF
			</Button>
			<input
				ref={inputRef}
				type="file"
				accept=".pdf,application/pdf"
				hidden
				onChange={(event) => {
					const file = event.target.files?.[0];
					if (file) onFile(file);
					// lets the same file be picked again
					event.target.value = '';
				}}
			/>
		</>
	);
}
