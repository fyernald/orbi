// builds a small real PDF for tests, one page per entry; an empty entry is a
// page without text, like a scanned page
export function createTestPdf(pages: string[]): Uint8Array {
	const pageIds = pages.map((_, index) => 4 + index * 2);
	const objects = [
		'<< /Type /Catalog /Pages 2 0 R >>',
		`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`,
		'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
	];
	for (const [index, text] of pages.entries()) {
		const lines = text
			.split('\n')
			.map((line) => line.replace(/[\\()]/g, (char) => `\\${char}`))
			.map((line) => `(${line}) Tj T*`)
			.join(' ');
		// tiny type, so up to 480 lines fit: pdf.js skips text outside the page
		const stream = text ? `BT /F1 1 Tf 1.5 TL 72 720 Td ${lines} ET` : '';
		objects.push(
			`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${pageIds[index]! + 1} 0 R >>`,
			`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`
		);
	}

	let pdf = '%PDF-1.4\n';
	const offsets = objects.map((body, index) => {
		const offset = pdf.length;
		pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
		return offset;
	});
	const xref = pdf.length;
	pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
	pdf += offsets
		.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`)
		.join('');
	pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
	return new TextEncoder().encode(pdf);
}
