// holds a chart's place in its card while Recharts loads
export function PlotPlaceholder() {
	return (
		<div
			aria-hidden
			className="h-64 rounded-lg bg-muted motion-safe:animate-pulse"
		/>
	);
}
