import { Menu } from 'lucide-react';
import Link from 'next/link';
import { OrbiLogo } from '@/components/brand/orbi-logo';
import { Button } from '@/components/ui/button';
import { routes } from '@/lib/routes';
import { TodayLabel } from './today-label';

export function TopBar({ onOpenMenu }: { onOpenMenu: () => void }) {
	return (
		<header className="flex h-16 shrink-0 items-center gap-3 border-b border-divider px-4 md:px-7">
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
			<TodayLabel className="hidden text-sm text-muted-foreground md:block" />
		</header>
	);
}
