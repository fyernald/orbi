import type { ChartTable } from '../../../visuals/chart-table';

// The chart's numbers as a table for screen readers, which cannot see the marks.
export function ChartDataTable({
	table,
	caption,
}: {
	table: ChartTable;
	caption: string;
}) {
	return (
		<table className="sr-only">
			<caption>{caption}</caption>
			<thead>
				<tr>
					{table.columns.map((column) => (
						<th key={column} scope="col">
							{column}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{table.rows.map((row, rowIndex) => (
					<tr key={rowIndex}>
						{row.map((cell, cellIndex) => (
							<td key={cellIndex}>{cell}</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
}
