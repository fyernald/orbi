import { z } from 'zod';

// What the tutor's visual tools take (US-42). The AI sends data, never code: the
// client draws it with Orbi's colours.

export const VISUAL_TITLE_MAX_LENGTH = 80;
export const VISUAL_DESCRIPTION_MAX_LENGTH = 400;
// a reply shows at most this many visuals (T-72)
export const VISUALS_PER_REPLY_MAX = 2;

export const DIAGRAM_KINDS = [
	'flowchart',
	'tree',
	'mindmap',
	'sequence',
	'state',
	'class',
	'er',
	'timeline',
	'graph',
] as const;
export type DiagramKind = (typeof DIAGRAM_KINDS)[number];

// Nodes of a flowchart or state diagram may take the classes c1 to c6 (A[Label]:::c2),
// which the app fills with the chart colours in order. The AI names a colour,
// never writes one.
export const DIAGRAM_COLOUR_CLASSES = 6;
export const COLOURED_DIAGRAM_TYPES = [
	'flowchart',
	'graph',
	'stateDiagram',
	'stateDiagram-v2',
] as const;

// about 15 nodes with short labels fit well inside this
export const DIAGRAM_SOURCE_MAX_LENGTH = 4000;

// the Mermaid diagram types each kind may be written as
const diagramTypes: Record<DiagramKind, readonly string[]> = {
	flowchart: ['flowchart', 'graph'],
	tree: ['flowchart', 'graph', 'mindmap'],
	mindmap: ['mindmap'],
	sequence: ['sequenceDiagram'],
	state: ['stateDiagram-v2', 'stateDiagram'],
	class: ['classDiagram'],
	er: ['erDiagram'],
	timeline: ['timeline'],
	graph: ['flowchart', 'graph'],
};

// The diagram type on the source's first line, after blank and comment lines.
// Mermaid reads the type from there.
export function mermaidDiagramType(source: string): string | undefined {
	for (const line of source.split('\n')) {
		const text = line.trim();
		if (!text || (text.startsWith('%%') && !text.startsWith('%%{'))) continue;
		return text.split(/\s/, 1)[0];
	}
	return undefined;
}

// What is wrong with the AI's Mermaid source, in words it can fix, or undefined.
// Config (front matter or %%{init}%%) is refused: the app sets the theme and the
// security level, and a diagram may not change them.
export function diagramSourceProblem(
	kind: DiagramKind,
	source: string
): string | undefined {
	if (source.startsWith('```')) {
		return 'Send the Mermaid source without code fences.';
	}
	if (source.startsWith('---') || source.includes('%%{')) {
		return 'Do not set Mermaid config or a theme. The app colours the diagram.';
	}
	const type = mermaidDiagramType(source);
	const allowed = diagramTypes[kind];
	if (!type || !allowed.includes(type)) {
		return `A ${kind} diagram must start with ${allowed.join(' or ')}.`;
	}
	return undefined;
}

const visualTitle = z
	.string()
	.trim()
	.min(1)
	.max(VISUAL_TITLE_MAX_LENGTH)
	.describe('A short title, like "Binary search tree after inserting 7".');

const visualDescription = z
	.string()
	.trim()
	.min(1)
	.max(VISUAL_DESCRIPTION_MAX_LENGTH)
	.describe('One or two sentences saying what it shows, for screen readers.');

export const createDiagramInput = z
	.object({
		title: visualTitle,
		kind: z.enum(DIAGRAM_KINDS),
		mermaid: z
			.string()
			.trim()
			.min(1)
			.max(DIAGRAM_SOURCE_MAX_LENGTH)
			.describe(
				'Mermaid source only: no code fences, no config, styles or colours.'
			),
		description: visualDescription,
	})
	.superRefine(({ kind, mermaid }, context) => {
		const problem = diagramSourceProblem(kind, mermaid);
		if (problem) {
			context.addIssue({ code: 'custom', path: ['mermaid'], message: problem });
		}
	});

// the diagram is in the chat; the model writes its explanation next
export const createDiagramOutput = z.object({ shown: z.literal(true) });

export type CreateDiagramInput = z.infer<typeof createDiagramInput>;
export type CreateDiagramOutput = z.infer<typeof createDiagramOutput>;
