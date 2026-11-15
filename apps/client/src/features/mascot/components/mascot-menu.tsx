'use client';

import { Compass, EyeOff, LifeBuoy, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useRef, type Ref } from 'react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { askOrbiRoute, tourRoute } from '@/lib/routes';
import { MascotArt } from './mascot-art';

type MascotMenuProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	// the cat itself, where the focus goes back after Help
	triggerRef: Ref<HTMLButtonElement>;
	onHelp: () => void;
	onHide: () => void;
};

const itemClass = 'h-9 gap-2.5 rounded-lg';

// the cat in the top bar; a click opens its quick actions
export function MascotMenu({
	open,
	onOpenChange,
	triggerRef,
	onHelp,
	onHide,
}: MascotMenuProps) {
	// A link leaves for another page, where the focus belongs (the message box,
	// the tour), so the closing menu does not pull it back to the cat
	const leaving = useRef(false);
	const leave = () => {
		leaving.current = true;
	};

	return (
		<DropdownMenu open={open} onOpenChange={onOpenChange}>
			<Tooltip>
				<TooltipTrigger asChild>
					<DropdownMenuTrigger asChild>
						<button
							ref={triggerRef}
							type="button"
							aria-label="Orbi cat: quick actions"
							className="grid size-9 shrink-0 place-items-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50 motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 data-[state=open]:ring-3 data-[state=open]:ring-ring/30"
						>
							<MascotArt pose="idle" />
						</button>
					</DropdownMenuTrigger>
				</TooltipTrigger>
				{/* on the left, so it never covers a tip under the cat */}
				<TooltipContent side="left" sideOffset={8}>
					Quick actions
				</TooltipContent>
			</Tooltip>
			<DropdownMenuContent
				align="end"
				sideOffset={8}
				onCloseAutoFocus={(event) => {
					if (!leaving.current) return;
					event.preventDefault();
					leaving.current = false;
				}}
				className="w-60 rounded-xl p-1.5 shadow-sm"
			>
				<DropdownMenuLabel className="px-2 py-1.5 text-sm font-medium text-foreground">
					Hi! What do you need?
				</DropdownMenuLabel>
				<DropdownMenuItem asChild className={itemClass} onSelect={leave}>
					<Link href={askOrbiRoute}>
						<MessageCircle />
						Ask Orbi
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild className={itemClass} onSelect={leave}>
					<Link href={tourRoute}>
						<Compass />
						Take the tour
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem className={itemClass} onSelect={onHelp}>
					<LifeBuoy />
					Help
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem className={itemClass} onSelect={onHide}>
					<EyeOff />
					Hide the cat
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
