import { BookOpen, ChevronDown, ChevronRight } from 'lucide-react';

type ComposerContextProps = {
	course: string;
	topic: string;
};

export function ComposerContext({ course, topic }: ComposerContextProps) {
	return (
		<div className="flex flex-wrap items-center gap-2 px-2.5 pt-2">
			<span className="text-[13px] text-muted-foreground">Questions for</span>
			<button
				type="button"
				title="Change course or topic"
				className="flex h-8 min-w-0 items-center gap-2 rounded-[10px] border border-border pr-2.5 pl-1.5 text-[13px] font-medium transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
			>
				<span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
					<BookOpen className="size-3" strokeWidth={2} />
				</span>
				<span className="truncate">{course}</span>
				<ChevronRight className="size-3 shrink-0 text-muted-foreground" />
				<span className="truncate">{topic}</span>
				<ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
			</button>
		</div>
	);
}
