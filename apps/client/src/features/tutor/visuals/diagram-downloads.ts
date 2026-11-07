import { downloadBlob, fileNameFor, type DownloadOption } from '@/lib/download';
import { readThemeTokens } from './mermaid-theme';
import { svgToPng } from './svg-image';

// a drawn diagram as an SVG to edit, or a PNG to put in notes or slides
export function diagramDownloads(svg: string, title: string): DownloadOption[] {
	return [
		{
			label: 'Download SVG',
			save: () =>
				downloadBlob(
					new Blob([svg], { type: 'image/svg+xml' }),
					fileNameFor(title, 'svg')
				),
		},
		{
			label: 'Download PNG',
			save: () =>
				void svgToPng(svg, readThemeTokens().card)
					.then((png) => downloadBlob(png, fileNameFor(title, 'png')))
					.catch((error: unknown) =>
						console.warn('The PNG could not be made.', error)
					),
		},
	];
}
