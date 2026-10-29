'use client';

import { Paperclip } from 'lucide-react';
import { useRef } from 'react';
import { acceptedFilesHint, acceptedFileTypes } from '../attachments';
import { ComposerToolButton } from './composer-tool-button';

export function AttachButton({
	onFiles,
}: {
	onFiles: (files: File[]) => void;
}) {
	const inputRef = useRef<HTMLInputElement>(null);

	return (
		<>
			<ComposerToolButton
				icon={Paperclip}
				label="Attach"
				hint={`Attach files: ${acceptedFilesHint}`}
				onClick={() => inputRef.current?.click()}
			/>
			<input
				ref={inputRef}
				type="file"
				multiple
				hidden
				accept={acceptedFileTypes}
				onChange={(event) => {
					onFiles(Array.from(event.target.files ?? []));
					// lets the same file be picked again after it is removed
					event.target.value = '';
				}}
			/>
		</>
	);
}
