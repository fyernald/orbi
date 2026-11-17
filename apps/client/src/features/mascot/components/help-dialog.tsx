'use client';

import { ArrowRight, Compass } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { tourRoute } from '@/lib/routes';
import { helpTopics } from '../help-topics';

type HelpDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	// it opens from a menu that is gone by then, so it says where the focus goes back
	returnFocus: () => void;
};

// the short help from the cat's menu; each link closes it on the way
export function HelpDialog({
	open,
	onOpenChange,
	returnFocus,
}: HelpDialogProps) {
	// a link moves to another page, where the focus belongs
	const leaving = useRef(false);
	const leave = () => {
		leaving.current = true;
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="gap-5 sm:max-w-md"
				onCloseAutoFocus={(event) => {
					event.preventDefault();
					if (!leaving.current) returnFocus();
					leaving.current = false;
				}}
			>
				<DialogHeader>
					<DialogTitle>How Orbi works</DialogTitle>
					<DialogDescription>
						Four things to get you studying.
					</DialogDescription>
				</DialogHeader>
				<ol className="flex flex-col gap-4">
					{helpTopics.map((topic, index) => (
						<li key={topic.title} className="flex gap-3">
							<span
								aria-hidden="true"
								className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
							>
								{index + 1}
							</span>
							<div className="flex min-w-0 flex-col gap-1">
								<h3 className="font-medium text-foreground">{topic.title}</h3>
								<p className="text-muted-foreground">{topic.body}</p>
								<DialogClose asChild>
									<Link
										href={topic.href}
										onClick={leave}
										className="flex w-fit items-center gap-1 rounded-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
									>
										{topic.link}
										<ArrowRight className="size-3.5" />
									</Link>
								</DialogClose>
							</div>
						</li>
					))}
				</ol>
				<DialogFooter>
					<DialogClose asChild>
						<Button asChild variant="outline" className="rounded-full">
							<Link href={tourRoute} onClick={leave}>
								<Compass />
								Take the tour
							</Link>
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
