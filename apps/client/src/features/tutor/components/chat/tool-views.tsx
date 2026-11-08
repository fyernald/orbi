'use client';

import type { AskStudentOutput, TutorTools } from '@orbi/shared';
import type { ComponentType } from 'react';
import type { TutorPart } from '../../chat';
import { AskStudentCard } from './ask-student-card';
import { QuestionSetCard } from './question-set-card';
import { ChartView } from './visuals/chart-view';
import { DiagramView } from './visuals/diagram-view';

type ToolName = keyof TutorTools;

export type ToolPart<Name extends ToolName> = Extract<
	TutorPart,
	{ type: `tool-${Name}` }
>;

// what a tool view can do in the chat
export type ChatActions = {
	answer: (toolCallId: string, output: AskStudentOutput) => void;
};

export type ToolViewProps<Name extends ToolName> = {
	part: ToolPart<Name>;
	// the student can act on it: the last reply, with nothing else running
	interactive: boolean;
	actions: ChatActions;
	// asks Orbi for this reply again; only the last finished reply has it
	onRetry?: () => void;
};

// One view per tool. A new tool in the shared TutorTools does not compile until
// it has a view here.
const toolViews: { [Name in ToolName]: ComponentType<ToolViewProps<Name>> } = {
	createQuestions: QuestionSetCard,
	askStudent: AskStudentCard,
	createDiagram: DiagramView,
	createChart: ChartView,
};

export function ToolView({
	part,
	interactive,
	actions,
	onRetry,
}: {
	part: TutorPart;
	interactive: boolean;
	actions: ChatActions;
	onRetry?: () => void;
}) {
	const name = part.type.slice('tool-'.length) as ToolName;
	const View = toolViews[name] as ComponentType<ToolViewProps<ToolName>>;
	// a reply saved by a newer version of Orbi
	if (!View) {
		return (
			<p className="text-sm text-muted-foreground">
				Orbi made something this page cannot show yet. Reload to see it.
			</p>
		);
	}
	return (
		<View
			part={part as ToolPart<ToolName>}
			interactive={interactive}
			actions={actions}
			onRetry={onRetry}
		/>
	);
}
