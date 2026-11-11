'use client';

import { CheckIcon } from 'lucide-react';
import { useId } from 'react';
import { FormError } from '@/components/form/form-error';
import { LoadError } from '@/components/load-error';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldLabel,
} from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { useModels } from '@/features/tutor/hooks';
import { apiErrorMessage } from '@/lib/api';
import { useSaveDefaultModel } from '../hooks';
import { DefaultModelButton } from './default-model-button';

// the model new chats start on (T-38); picking one saves it at once
export function DefaultModelSettingsCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>AI model</CardTitle>
				<CardDescription>
					New chats start on this model. You can still switch models in any
					chat.
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<DefaultModelContent />
			</CardContent>
		</Card>
	);
}

function DefaultModelContent() {
	const models = useModels();
	const save = useSaveDefaultModel();
	const buttonId = useId();

	if (models.isPending) {
		return (
			<p className="flex items-center gap-2 text-sm text-muted-foreground">
				<Spinner />
				Loading models
			</p>
		);
	}
	if (models.isError) {
		return (
			<LoadError
				message={apiErrorMessage(models.error)}
				onRetry={() => void models.refetch()}
			/>
		);
	}
	if (models.data.models.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">
				The AI tutor is not set up on this server yet.
			</p>
		);
	}

	// the picked model shows at once, before the server answers
	const selectedId =
		(save.isPending && save.variables.defaultModelId) ||
		models.data.defaultModelId ||
		'';
	const selected = models.data.models.find(({ id }) => id === selectedId);

	return (
		<>
			<Field orientation="horizontal">
				<FieldContent>
					<FieldLabel htmlFor={buttonId}>Default model</FieldLabel>
					{selected && <FieldDescription>{selected.goodAt}</FieldDescription>}
				</FieldContent>
				<DefaultModelButton
					id={buttonId}
					models={models.data.models}
					selectedId={selectedId}
					disabled={save.isPending}
					onSelect={(defaultModelId) => save.mutate({ defaultModelId })}
				/>
			</Field>
			<FormError message={apiErrorMessage(save.error)} />
			{save.isSuccess && (
				<p className="flex items-center gap-1.5 text-sm text-muted-foreground">
					<CheckIcon className="size-4" />
					Saved
				</p>
			)}
		</>
	);
}
