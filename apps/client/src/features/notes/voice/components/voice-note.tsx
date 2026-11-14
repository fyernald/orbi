'use client';

import { VOICE_NOTE_MAX_SECONDS } from '@orbi/shared';
import { CircleCheck, Mic } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { FormError } from '@/components/form/form-error';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ModelPicker } from '@/features/tutor/components/model-picker';
import { useModelChoice } from '@/features/tutor/use-model-choice';
import { cannotListenReason } from '../recording';
import { useVoiceNote } from '../use-voice-note';
import { RecordingBar } from './recording-bar';
import { TidySwitch } from './tidy-switch';

type VoiceNoteProps = {
	courseId: string;
	topicId: string;
};

// A third way to add notes (US-47): the student speaks, and the model picked
// here (the student's default at first) writes it down, tidied if they want.
// The recording is not kept; only the note is.
export function VoiceNote({ courseId, topicId }: VoiceNoteProps) {
	const { models, modelId, setModelId } = useModelChoice();
	const [tidy, setTidy] = useState(false);
	const latest = useRef({ modelId, tidy });
	useEffect(() => {
		latest.current = { modelId, tidy };
	});
	const voice = useVoiceNote({
		courseId,
		topicId,
		choice: () => latest.current,
	});
	const cannotListen = cannotListenReason(modelId, models);
	const { recorder, state } = voice;

	return (
		<div className="flex flex-col gap-2 rounded-xl border border-dashed border-border px-3.5 py-3">
			{recorder.status === 'recording' ? (
				<RecordingBar
					seconds={recorder.seconds}
					maxSeconds={VOICE_NOTE_MAX_SECONDS}
					onStop={voice.stop}
					onCancel={voice.cancel}
				/>
			) : state.status === 'writing' ? (
				<div className="flex items-center gap-3">
					<p
						role="status"
						className="flex min-w-0 flex-1 items-center gap-2 text-sm text-muted-foreground"
					>
						<Spinner />
						Orbi is writing your voice note…
					</p>
					<Button
						type="button"
						variant="ghost"
						onClick={voice.cancel}
						className="h-8 shrink-0 rounded-lg px-3"
					>
						Cancel
					</Button>
				</div>
			) : (
				<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
					<p className="min-w-0 flex-1 basis-48 text-sm text-muted-foreground">
						Or record a voice note, up to {VOICE_NOTE_MAX_SECONDS / 60} minutes.
						Orbi writes it down.
					</p>
					<div className="flex shrink-0 flex-wrap items-center gap-1">
						<TidySwitch checked={tidy} onChange={setTidy} />
						{models.length > 0 && (
							<ModelPicker
								models={models}
								selectedId={modelId}
								onSelect={setModelId}
							/>
						)}
						<Button
							type="button"
							variant="outline"
							onClick={voice.start}
							disabled={
								!modelId ||
								cannotListen !== null ||
								recorder.status === 'starting'
							}
							aria-describedby={cannotListen ? `${topicId}-voice` : undefined}
							className="h-8 shrink-0 rounded-lg px-3"
						>
							{recorder.status === 'starting' ? <Spinner /> : <Mic />}
							Record
						</Button>
					</div>
				</div>
			)}
			{cannotListen && recorder.status === 'idle' && (
				<p id={`${topicId}-voice`} className="text-xs text-muted-foreground">
					{cannotListen}
				</p>
			)}
			{state.status === 'error' && <FormError message={state.message} />}
			{state.status === 'saved' && (
				<p
					role="status"
					className="flex items-center gap-1.5 text-xs text-muted-foreground"
				>
					<CircleCheck className="size-3.5 text-primary" />
					Orbi saved your voice note “{state.title}”.
				</p>
			)}
		</div>
	);
}
