export function LiveCount({ count }: { count: number }) {
	return (
		<span className="flex items-center gap-1.5 text-[13px] text-[#0a7457]">
			<span aria-hidden="true" className="size-1.5 rounded-full bg-[#2bd4a4]" />
			{count} live
		</span>
	);
}
