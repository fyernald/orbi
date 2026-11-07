'use client';

import { Check, Copy, Download, Maximize2 } from 'lucide-react';
import {
	useEffect,
	useState,
	type ComponentProps,
	type ReactNode,
} from 'react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import type { DownloadOption } from '@/lib/download';

// how long the tick shows after copying
const COPIED_MS = 2000;

type IconActionProps = ComponentProps<typeof Button> & {
	label: string;
	children: ReactNode;
};

// a small icon button in a visual's toolbar, named by its tooltip and for screen readers
export function IconAction({ label, children, ...props }: IconActionProps) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="ghost"
					size="icon-sm"
					aria-label={label}
					className="text-muted-foreground"
					{...props}
				>
					{children}
				</Button>
			</TooltipTrigger>
			<TooltipContent>{label}</TooltipContent>
		</Tooltip>
	);
}

export function CopySourceAction({
	source,
	label,
}: {
	source: string;
	label: string;
}) {
	const [copied, setCopied] = useState(false);
	useEffect(() => {
		if (!copied) return;
		const timer = setTimeout(() => setCopied(false), COPIED_MS);
		return () => clearTimeout(timer);
	}, [copied]);

	const copy = () =>
		navigator.clipboard
			?.writeText(source)
			.then(() => setCopied(true))
			.catch(() => {});

	return (
		<>
			<IconAction label={label} onClick={() => void copy()}>
				{copied ? <Check /> : <Copy />}
			</IconAction>
			<span aria-live="polite" className="sr-only">
				{copied ? 'Copied to the clipboard' : ''}
			</span>
		</>
	);
}

export function DownloadAction({ options }: { options: DownloadOption[] }) {
	return (
		<DropdownMenu>
			<Tooltip>
				<TooltipTrigger asChild>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon-sm"
							aria-label="Download"
							className="text-muted-foreground"
						>
							<Download />
						</Button>
					</DropdownMenuTrigger>
				</TooltipTrigger>
				<TooltipContent>Download</TooltipContent>
			</Tooltip>
			<DropdownMenuContent align="end">
				{options.map((option) => (
					<DropdownMenuItem key={option.label} onSelect={option.save}>
						{option.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function FullScreenAction({ onOpen }: { onOpen: () => void }) {
	return (
		<IconAction label="Full screen" onClick={onOpen}>
			<Maximize2 />
		</IconAction>
	);
}
