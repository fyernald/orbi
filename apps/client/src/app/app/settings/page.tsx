import type { Metadata } from 'next';
import { getServerProfile } from '@/features/profile/server';
import { DefaultModelSettingsCard } from '@/features/settings/components/default-model-settings';
import { ReminderSettingsCard } from '@/features/settings/components/reminder-settings';
import { toReminderValues } from '@/features/settings/reminder';

export const metadata: Metadata = { title: 'Settings' };

export default async function SettingsPage() {
	const saved = await getServerProfile();

	return (
		<section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 md:px-7">
			<header className="flex flex-col gap-1">
				<h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
			</header>
			<DefaultModelSettingsCard />
			<ReminderSettingsCard
				saved={toReminderValues(saved)}
				timezone={saved.timezone}
			/>
		</section>
	);
}
