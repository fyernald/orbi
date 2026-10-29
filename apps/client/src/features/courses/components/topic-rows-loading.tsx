// grey rows in the shape of topics, so the pane does not jump when they arrive
export function TopicRowsLoading() {
	return (
		<ul aria-label="Loading topics" className="flex flex-col gap-1 p-1">
			{[0, 1, 2, 3].map((row) => (
				<li key={row} className="flex items-center gap-2.5 py-1.5 pl-1">
					<span className="size-6 animate-pulse rounded-md bg-muted" />
					<span className="flex flex-1 flex-col gap-1.5">
						<span className="h-3 w-3/5 animate-pulse rounded-full bg-muted" />
						<span className="h-2.5 w-1/4 animate-pulse rounded-full bg-muted" />
					</span>
				</li>
			))}
		</ul>
	);
}
