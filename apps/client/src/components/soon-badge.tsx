// marks a feature that is shown but not built yet; it cannot be used until then
export function SoonBadge() {
	return (
		<span className="rounded-full bg-tone-amber px-1.5 py-px text-[10px] font-semibold tracking-wide text-tone-amber-foreground uppercase">
			Soon
		</span>
	);
}
