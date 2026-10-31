// a chat that is not on screen is still getting its reply
export function ReplyingDot() {
	return (
		<span className="flex size-4 shrink-0 items-center justify-center">
			<span className="size-2 animate-pulse rounded-full bg-primary motion-reduce:animate-none" />
			<span className="sr-only">Orbi is replying</span>
		</span>
	);
}
