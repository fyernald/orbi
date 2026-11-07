// the parts of an HTML tree (hast) this needs; Streamdown builds the tree
type HastNode = {
	type: string;
	tagName?: string;
	value?: string;
	properties?: Record<string, unknown>;
	children?: HastNode[];
};

// 12, -3.5, 1,200, 45%, $10, 3 kg; not ordinals like 2nd
const NUMBER = /^[+\-−±~≈]?[$€£¥]?\d[\d.,\s]*(?:\s?(?:%|[a-zA-Zµ°]{1,3}))?$/;
const ORDINAL = /^\d+(?:st|nd|rd|th)$/i;

export function isNumeric(text: string): boolean {
	const value = text.trim();
	return NUMBER.test(value) && !ORDINAL.test(value);
}

// a column is numeric when each filled cell below the header is a number
export function numericColumns(rows: string[][]): Set<number> {
	const columns = new Set<number>();
	const width = Math.max(0, ...rows.map((row) => row.length));
	for (let column = 0; column < width; column++) {
		const filled = rows
			.map((row) => row[column]?.trim() ?? '')
			.filter((cell) => cell !== '');
		if (filled.length > 0 && filled.every(isNumeric)) columns.add(column);
	}
	return columns;
}

const textOf = (node: HastNode): string =>
	node.type === 'text'
		? (node.value ?? '')
		: (node.children ?? []).map(textOf).join('');

const childElements = (node: HastNode, tagNames: string[]) =>
	(node.children ?? []).filter(
		(child) =>
			child.type === 'element' && tagNames.includes(child.tagName ?? '')
	);

const rowsIn = (section: HastNode) => childElements(section, ['tr']);
const cellsIn = (row: HastNode) => childElements(row, ['th', 'td']);

function alignTable(table: HastNode) {
	const head = childElements(table, ['thead']).flatMap(rowsIn);
	const body = childElements(table, ['tbody']).flatMap(rowsIn);
	const numeric = numericColumns(body.map((row) => cellsIn(row).map(textOf)));
	if (numeric.size === 0) return;
	for (const row of [...head, ...body]) {
		cellsIn(row).forEach((cell, column) => {
			// a column the AI aligned itself keeps its alignment
			if (!numeric.has(column) || cell.properties?.align) return;
			cell.properties = { ...cell.properties, align: 'right' };
		});
	}
}

function visit(node: HastNode) {
	if (node.type === 'element' && node.tagName === 'table') alignTable(node);
	else node.children?.forEach(visit);
}

// A rehype plugin: table columns of numbers are right-aligned, so the digits line up.
export function alignNumericColumns() {
	return (tree: HastNode) => visit(tree);
}
