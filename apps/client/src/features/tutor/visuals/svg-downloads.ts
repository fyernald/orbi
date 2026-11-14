import { downloadBlob, fileNameFor, type DownloadOption } from '@/lib/download';
import { svgToPng } from './svg-image';
import { readThemeTokens } from './theme-tokens';

// A drawn visual as an SVG to edit, or a PNG to put in notes or slides. The SVG is
// read when the student picks an option, so a chart gives the one on screen now.
export function svgDownloads(
	readSvg: () => string | undefined,
	title: string
): DownloadOption[] {
	const withSvg = (save: (svg: string) => void) => () => {
		const svg = readSvg();
		if (svg) save(svg);
	};
	return [
		{
			label: 'Download SVG',
			save: withSvg((svg) =>
				downloadBlob(
					new Blob([svg], { type: 'image/svg+xml' }),
					fileNameFor(title, 'svg')
				)
			),
		},
		{
			label: 'Download PNG',
			save: withSvg(
				(svg) =>
					void svgToPng(svg, readThemeTokens().card)
						.then((png) => downloadBlob(png, fileNameFor(title, 'png')))
						.catch((error: unknown) =>
							console.warn('The PNG could not be made.', error)
						)
			),
		},
	];
}
