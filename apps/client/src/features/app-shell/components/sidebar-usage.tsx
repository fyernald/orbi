'use client';

import { UsageMeter } from '@/features/usage/components/usage-meter';
import { useAiUsage } from '@/features/usage/hooks';
import { liveWindow } from '@/features/usage/usage';
import { useNow } from '@/hooks/use-now';
import { SidebarTooltip } from './sidebar-tooltip';

// the usage meter at the bottom of the sidebar, above the account
export function SidebarUsage({ collapsed }: { collapsed: boolean }) {
	const { data } = useAiUsage();
	const now = useNow(30_000);
	if (!data) return null;

	const hour = liveWindow(data.hour, now);
	const week = liveWindow(data.week, now);

	return (
		<SidebarTooltip
			label={`AI: ${hour.percent}% of this hour, ${week.percent}% of this week`}
			show={collapsed}
		>
			<div>
				<UsageMeter hour={hour} week={week} compact={collapsed} />
			</div>
		</SidebarTooltip>
	);
}
