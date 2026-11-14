const HEX = /^#([0-9a-f]{6})$/i;

const channels = (hex: string) => {
	const value = Number.parseInt(hex.slice(1), 16);
	return [(value >> 16) & 255, (value >> 8) & 255, value & 255] as const;
};

// `color` laid over `base` at `weight` (0 to 1), as hex: the soft fills of diagram
// nodes. Mermaid works its own colours out from hex, so tints are mixed here.
export function mixHex(color: string, base: string, weight: number): string {
	if (!HEX.test(color) || !HEX.test(base)) {
		throw new Error(`Not a #rrggbb colour: ${color}, ${base}`);
	}
	const top = channels(color);
	const bottom = channels(base);
	return `#${top
		.map((value, index) =>
			Math.round(value * weight + bottom[index]! * (1 - weight))
				.toString(16)
				.padStart(2, '0')
		)
		.join('')}`;
}

const toHexByte = (value: number) => value.toString(16).padStart(2, '0');

let painter: CanvasRenderingContext2D | null | undefined;

// Any CSS colour (#fff, rgb(), oklch()) as #rrggbb, by painting one pixel. The
// CSS build may shorten or convert the theme's colours, and Mermaid needs hex.
export function cssColorToHex(color: string): string {
	painter ??= document
		.createElement('canvas')
		.getContext('2d', { willReadFrequently: true });
	if (!painter) return color;
	painter.clearRect(0, 0, 1, 1);
	painter.fillStyle = color;
	painter.fillRect(0, 0, 1, 1);
	const [red, green, blue] = painter.getImageData(0, 0, 1, 1).data;
	return `#${toHexByte(red!)}${toHexByte(green!)}${toHexByte(blue!)}`;
}
