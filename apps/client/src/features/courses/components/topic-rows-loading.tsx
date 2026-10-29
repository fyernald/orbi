// grey rows in the shape of topics, so the panel does not jump when they arrive
export function TopicRowsLoading() {
	return (
		<ul aria-label="Loading topics" className="divide-y divide-divider">
			{[0, 1, 2].map((row) => (
				<li key={row} className="flex items-center gap-4 px-5 py-3.5">
					<span className="size-10 animate-pulse rounded-xl bg-muted" />
					<span className="flex flex-1 flex-col gap-2">
						<span className="h-3.5 w-2/5 animate-pulse rounded-full bg-muted" />
						<span className="h-3 w-1/5 animate-pulse rounded-full bg-muted" />
					</span>
				</li>
			))}
		</ul>
	);
}
