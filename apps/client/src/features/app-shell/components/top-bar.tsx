import { Menu } from 'lucide-react';
import Link from 'next/link';
import { OrbiLogo } from '@/components/brand/orbi-logo';
import { Button } from '@/components/ui/button';
import { routes } from '@/lib/routes';
import { studyStatus } from '../mock-data';
import { PageTitle } from './page-title';
import { ReviewButton } from './review-button';
import { StreakLink } from './streak-link';

export function TopBar({ onOpenMenu }: { onOpenMenu: () => void }) {
	return (
		<header className="flex h-14 shrink-0 items-center gap-3 border-b border-divider px-4 md:px-7">
			<Button
				variant="ghost"
				size="icon-lg"
				onClick={onOpenMenu}
				aria-label="Open menu"
				className="-ml-1.5 rounded-xl text-subtle-foreground md:hidden"
			>
				<Menu className="size-5" />
			</Button>
			<Link href={routes.app} aria-label="Orbi home" className="md:hidden">
				<OrbiLogo />
			</Link>
			<PageTitle className="hidden text-sm font-medium md:block" />
			<div className="ml-auto flex items-center gap-2">
				<StreakLink days={studyStatus.streakDays} />
				<ReviewButton dueCount={studyStatus.dueCount} />
			</div>
		</header>
	);
}
