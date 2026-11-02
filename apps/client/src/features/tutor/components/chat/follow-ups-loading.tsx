// grey pills in the place of the questions
const widths = ['w-56', 'w-72', 'w-48'];

export function FollowUpsLoading() {
	return (
		<div
			role="status"
			aria-label="Finding follow-up questions"
			className="flex flex-col items-start gap-1.5"
		>
			{widths.map((width) => (
				<span
					key={width}
					className={`h-8 max-w-full ${width} animate-pulse rounded-2xl bg-muted motion-reduce:animate-none`}
				/>
			))}
		</div>
	);
}
