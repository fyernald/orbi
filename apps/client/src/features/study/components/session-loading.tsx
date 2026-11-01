// grey blocks in the shape of the header and one question
export function SessionLoading() {
	return (
		<div
			role="status"
			aria-label="Loading the questions"
			className="flex flex-col gap-8"
		>
			<div className="flex flex-col gap-3">
				<div className="h-4 w-1/4 animate-pulse rounded bg-muted motion-reduce:animate-none" />
				<div className="h-7 w-1/2 animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
				<div className="mt-1 h-1.5 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
			</div>
			<div className="flex flex-col gap-2">
				<div className="mb-2 h-6 w-4/5 animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
				{[0, 1, 2, 3].map((choice) => (
					<div
						key={choice}
						className="h-12 animate-pulse rounded-lg bg-muted motion-reduce:animate-none"
					/>
				))}
			</div>
		</div>
	);
}
