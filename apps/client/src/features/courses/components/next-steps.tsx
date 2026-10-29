import { NextStepItem } from './next-step-item';

type NextStepsProps = {
	topicCount: number;
	// undefined while the topics are loading
	noteCount: number | undefined;
};

// what to do next in this course; steps that are not built yet say so
export function NextSteps({ topicCount, noteCount }: NextStepsProps) {
	return (
		<section className="rounded-3xl border border-border bg-card p-5 shadow-xs">
			<h2 className="font-medium">Next steps</h2>
			<ol className="mt-4 flex flex-col gap-4">
				<NextStepItem
					number={1}
					done={topicCount > 0}
					title="Add your topics"
					text="One for each chapter or lecture."
				/>
				<NextStepItem
					number={2}
					done={(noteCount ?? 0) > 0}
					title="Add notes to a topic"
					text="Paste or upload what you study."
					soon
				/>
				<NextStepItem
					number={3}
					done={false}
					title="Practise with questions"
					text="Orbi writes them from your notes."
					soon
				/>
			</ol>
		</section>
	);
}
