import type { Metadata } from 'next';
import { AuthCard } from '@/features/auth/components/auth-card';
import { BetaKeyForm } from '@/features/beta/components/beta-key-form';
import { keyPageCopy } from '@/features/beta/key-page-copy';
import { getServerBetaAccess } from '@/features/beta/server';

export const metadata: Metadata = { title: 'Beta key' };

// the layout has checked the session and the access; the call is cached for this request
export default async function BetaKeyPage() {
	const { title, description } = keyPageCopy(await getServerBetaAccess());

	return (
		<AuthCard
			title={title}
			description={description}
			footer={
				<p className="text-center text-sm text-muted-foreground">
					No key yet? Ask the Orbi team for one.
				</p>
			}
		>
			<BetaKeyForm />
		</AuthCard>
	);
}
