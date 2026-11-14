import { SessionLayout } from './session-layout';

const block = 'animate-pulse bg-muted motion-reduce:animate-none';

// grey blocks in the shape of the page: the course and the ring, one question, the map
export function SessionLoading() {
	return (
		<div role="status" aria-label="Loading the questions">
			<SessionLayout
				start={
					<>
						<div className="flex flex-col gap-2">
							<div className={`h-4 w-1/2 rounded ${block}`} />
							<div className={`h-7 w-3/4 rounded-lg ${block}`} />
						</div>
						<div className={`h-44 rounded-2xl ${block}`} />
					</>
				}
				end={
					<div className="grid grid-cols-[repeat(auto-fill,minmax(2rem,1fr))] gap-1.5">
						{Array.from({ length: 10 }, (_, index) => (
							<div
								key={index}
								className={`aspect-square rounded-lg ${block}`}
							/>
						))}
					</div>
				}
			>
				<div className="flex flex-col gap-3 @5xl:hidden">
					<div className={`h-4 w-1/4 rounded ${block}`} />
					<div className={`h-7 w-1/2 rounded-lg ${block}`} />
					<div className={`mt-1 h-1.5 rounded-full ${block}`} />
				</div>
				<div className="flex flex-col gap-2">
					<div className={`mb-2 h-6 w-4/5 rounded-lg ${block}`} />
					{[0, 1, 2, 3].map((choice) => (
						<div key={choice} className={`h-12 rounded-lg ${block}`} />
					))}
				</div>
			</SessionLayout>
		</div>
	);
}
