'use client';

import type { TutorRequestInput } from '@orbi/shared';
import { useController, type Control } from 'react-hook-form';
import type { AiModel } from '../mock-data';
import { AttachButton } from './attach-button';
import { ModelPicker } from './model-picker';
import { SendButton } from './send-button';

type ComposerToolbarProps = {
	control: Control<TutorRequestInput>;
	models: AiModel[];
	onFiles: (files: File[]) => void;
	sendLabel: string;
	blockedReason: string | null;
};

export function ComposerToolbar({
	control,
	models,
	onFiles,
	sendLabel,
	blockedReason,
}: ComposerToolbarProps) {
	const { field: modelField } = useController({ control, name: 'modelId' });

	return (
		<div className="flex items-center gap-1.5 p-1">
			<AttachButton onFiles={onFiles} />
			<div className="ml-auto flex items-center gap-1">
				<ModelPicker
					models={models}
					selectedId={modelField.value}
					onSelect={modelField.onChange}
				/>
				<SendButton label={sendLabel} blockedReason={blockedReason} />
			</div>
		</div>
	);
}
