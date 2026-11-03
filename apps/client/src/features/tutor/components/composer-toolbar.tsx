'use client';

import type { AiModel, TutorRequestInput } from '@orbi/shared';
import { useController, type Control } from 'react-hook-form';
import { AttachButton } from './attach-button';
import { ModelPicker } from './model-picker';
import { SendButton } from './send-button';
import { StopButton } from './stop-button';
import { ThinkToggle } from './think-toggle';

type ComposerToolbarProps = {
	control: Control<TutorRequestInput>;
	models: AiModel[];
	// without it the Attach button is hidden
	onFiles?: (files: File[]) => void;
	sendLabel: string;
	blockedReason: string | null;
	busy: boolean;
	onStop?: () => void;
};

export function ComposerToolbar({
	control,
	models,
	onFiles,
	sendLabel,
	blockedReason,
	busy,
	onStop,
}: ComposerToolbarProps) {
	const { field: modelField } = useController({ control, name: 'modelId' });
	const { field: thinkingField } = useController({
		control,
		name: 'thinking',
	});

	return (
		<div className="flex items-center gap-1.5 p-1">
			{onFiles && <AttachButton onFiles={onFiles} />}
			<div className="ml-auto flex items-center gap-1">
				<ThinkToggle
					on={thinkingField.value}
					onChange={thinkingField.onChange}
				/>
				<ModelPicker
					models={models}
					selectedId={modelField.value}
					onSelect={modelField.onChange}
				/>
				{busy && onStop ? (
					<StopButton onStop={onStop} />
				) : (
					<SendButton label={sendLabel} blockedReason={blockedReason} />
				)}
			</div>
		</div>
	);
}
