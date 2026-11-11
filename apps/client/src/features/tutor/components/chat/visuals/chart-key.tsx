import { chartColor } from '../../../visuals/chart-colors';

export type ChartKeyEntry = { name: string; detail?: string };

// The legend: a colour swatch beside each name, in the chart colours' order. The
// names stay in the normal text colours, so none depends on its colour to be read.
export function ChartKey({ entries }: { entries: ChartKeyEntry[] }) {
	return (
		<ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
			{entries.map(({ name, detail }, index) => (
				<li key={name} className="flex items-center gap-1.5">
					<span
						aria-hidden
						className="size-2.5 shrink-0 rounded-[3px]"
						style={{ backgroundColor: chartColor(index) }}
					/>
					<span>{name}</span>
					{detail && (
						<span className="font-medium text-foreground tabular-nums">
							{detail}
						</span>
					)}
				</li>
			))}
		</ul>
	);
}
