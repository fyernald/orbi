import type { FormulaScope, InteractiveValue } from '@orbi/shared';
import { formatReadout } from '../../../visuals/readout-format';

// The values worked out from the controls, each in a tile of its own like the
// results of a calculator. They change as the controls move.
export function InteractiveReadouts({
	values,
	scope,
}: {
	values: InteractiveValue[];
	scope: FormulaScope;
}) {
	return (
		<dl className="grid grid-cols-2 gap-2 @md:grid-cols-3">
			{values.map(({ name, label, decimals, unit }) => (
				<div
					key={name}
					className="flex min-w-0 flex-col gap-0.5 rounded-xl bg-muted/60 px-3 py-2.5"
				>
					<dt className="truncate text-xs text-muted-foreground">{label}</dt>
					<dd className="truncate text-lg font-semibold tabular-nums">
						{formatReadout(scope[name], decimals, unit)}
					</dd>
				</div>
			))}
		</dl>
	);
}
