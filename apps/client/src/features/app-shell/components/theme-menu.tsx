'use client';

import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const themes: { value: string; label: string; icon: LucideIcon }[] = [
	{ value: 'light', label: 'Light', icon: Sun },
	{ value: 'dark', label: 'Dark', icon: Moon },
	{ value: 'system', label: 'System', icon: Monitor },
];

// the button's icon follows the page's dark class, so it is right from the first paint
export function ThemeMenu() {
	const { theme, setTheme } = useTheme();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon-lg"
					aria-label="Change theme"
					className="rounded-xl text-subtle-foreground"
				>
					<Sun className="size-5 dark:hidden" />
					<Moon className="hidden size-5 dark:block" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				sideOffset={6}
				className="w-40 rounded-xl p-1.5 shadow-sm"
			>
				<DropdownMenuLabel className="px-2 py-1.5 text-[13px] font-normal text-muted-foreground">
					Theme
				</DropdownMenuLabel>
				<DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
					{themes.map(({ value, label, icon: Icon }) => (
						<DropdownMenuRadioItem
							key={value}
							value={value}
							className="gap-2.5 rounded-lg px-2"
						>
							<Icon />
							{label}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
