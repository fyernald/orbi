import { ArrowRight } from 'lucide-react';
import { KeyHint } from '@/components/key-hint';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

type OnboardingFooterProps = {
	label: string;
	// what Enter does, shown next to the key
	hint: string;
	ready: boolean;
	pending: boolean;
};

// the one action of the screen; it stays off until the question is answered
export function OnboardingFooter({
	label,
	hint,
	ready,
	pending,
}: OnboardingFooterProps) {
	return (
		<>
			<span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
				<KeyHint>Enter</KeyHint>
				{hint}
			</span>
			<Button
				type="submit"
				disabled={!ready || pending}
				className="ml-auto h-11 rounded-full px-6 text-[15px] transition-[background-color,opacity,transform] duration-200"
			>
				{label}
				{pending ? <Spinner /> : <ArrowRight />}
			</Button>
		</>
	);
}
