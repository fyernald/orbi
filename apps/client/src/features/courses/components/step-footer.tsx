import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { KeyHint } from './key-hint';

type StepFooterProps = {
	isFirst: boolean;
	isLast: boolean;
	pending: boolean;
	cancelHref: string;
	onBack: () => void;
};

export function StepFooter({
	isFirst,
	isLast,
	pending,
	cancelHref,
	onBack,
}: StepFooterProps) {
	return (
		<>
			{isFirst ? (
				<Button asChild variant="ghost" className="h-10 rounded-full px-4">
					<Link href={cancelHref}>Cancel</Link>
				</Button>
			) : (
				<Button
					type="button"
					variant="ghost"
					onClick={onBack}
					className="h-10 rounded-full px-4"
				>
					<ArrowLeft />
					Back
				</Button>
			)}
			<div className="flex items-center gap-3">
				<span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
					<KeyHint>Enter</KeyHint>
					{isLast ? 'to create' : 'to continue'}
				</span>
				<Button
					type="submit"
					disabled={pending}
					className="h-10 rounded-full px-5"
				>
					{isLast ? 'Create course' : 'Next step'}
					{pending ? <Spinner /> : <ArrowRight />}
				</Button>
			</div>
		</>
	);
}
