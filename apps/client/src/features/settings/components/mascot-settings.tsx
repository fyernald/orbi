'use client';

import { useId } from 'react';
import { FormError } from '@/components/form/form-error';
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
import { Switch } from '@/components/ui/switch';
import { MascotArt } from '@/features/mascot/components/mascot-art';
import { useMascotEnabled, useSaveMascot } from '@/features/mascot/hooks';
import { apiErrorMessage } from '@/lib/api';

// the cat in the top bar (US-48); the switch saves at once
export function MascotSettingsCard({ saved }: { saved: boolean }) {
	const enabled = useMascotEnabled(saved);
	const save = useSaveMascot();
	const switchId = useId();

	return (
		<Card>
			<CardHeader>
				<CardTitle>Orbi cat</CardTitle>
				<CardDescription>
					A small cat in the top bar, with quick ways to ask Orbi, take the
					tour, and get help.
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<Field orientation="horizontal">
					<MascotArt pose="idle" className="size-10" />
					<FieldContent>
						<FieldLabel htmlFor={switchId}>Show the cat</FieldLabel>
						<FieldDescription>On every device you sign in on.</FieldDescription>
					</FieldContent>
					<Switch
						id={switchId}
						checked={enabled}
						onCheckedChange={(checked) =>
							save.mutate({ mascotEnabled: checked })
						}
					/>
				</Field>
				<FormError message={apiErrorMessage(save.error)} />
			</CardContent>
		</Card>
	);
}
