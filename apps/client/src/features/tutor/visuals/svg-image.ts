// the drawing size of an SVG from its viewBox, for a PNG of the same shape
export function svgSize(
	svg: string
): { width: number; height: number } | undefined {
	const viewBox =
		/viewBox="\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)\s*"/.exec(
			svg
		);
	if (!viewBox) return undefined;
	const width = Number(viewBox[1]);
	const height = Number(viewBox[2]);
	return width > 0 && height > 0 ? { width, height } : undefined;
}

// a PNG of the SVG on a solid background, at twice the size so it stays sharp
export async function svgToPng(
	svg: string,
	background: string,
	scale = 2
): Promise<Blob> {
	const size = svgSize(svg);
	if (!size) throw new Error('The diagram has no size.');
	const url = URL.createObjectURL(
		new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
	);
	try {
		const image = new Image();
		image.src = url;
		await image.decode();
		const canvas = document.createElement('canvas');
		canvas.width = Math.ceil(size.width * scale);
		canvas.height = Math.ceil(size.height * scale);
		const context = canvas.getContext('2d');
		if (!context) throw new Error('No canvas.');
		context.fillStyle = background;
		context.fillRect(0, 0, canvas.width, canvas.height);
		context.drawImage(image, 0, 0, canvas.width, canvas.height);
		return await new Promise<Blob>((resolve, reject) =>
			canvas.toBlob(
				(blob) => (blob ? resolve(blob) : reject(new Error('No PNG.'))),
				'image/png'
			)
		);
	} finally {
		URL.revokeObjectURL(url);
	}
}
