// stands in for the upload endpoint until the API is ready;
// replace with a call in lib/api.ts and keep the same shape

export type UploadInput = {
	file: File;
	signal: AbortSignal;
	onProgress: (progress: number) => void;
};

export function uploadAttachment({
	file,
	signal,
	onProgress,
}: UploadInput): Promise<void> {
	// about 1 second per 2 MB, kept between 1 and 4 seconds so the progress is visible
	const duration = Math.min(4000, Math.max(1000, file.size / 2000));

	return new Promise((resolve, reject) => {
		const started = performance.now();
		const timer = setInterval(() => {
			const progress = Math.min(1, (performance.now() - started) / duration);
			onProgress(progress);
			if (progress === 1) {
				clearInterval(timer);
				resolve();
			}
		}, 80);

		signal.addEventListener(
			'abort',
			() => {
				clearInterval(timer);
				reject(signal.reason);
			},
			{ once: true }
		);
	});
}
