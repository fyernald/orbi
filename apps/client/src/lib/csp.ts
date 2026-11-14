type PolicyOptions = {
	// new for every page request
	nonce: string;
	dev: boolean;
	// the error monitoring address the browser may send to, if any
	reportsTo?: string;
	// the sandbox origin mini-apps run in, if this build has one
	framesFrom?: string;
};

// Where a page may load from. Scripts need this request's nonce (Next.js adds it to
// its own scripts), and the scripts they load are trusted in turn ('strict-dynamic').
// Styles stay open to inline ones: React, Radix and KaTeX write style attributes.
export function contentSecurityPolicy({
	nonce,
	dev,
	reportsTo,
	framesFrom,
}: PolicyOptions): string {
	return [
		"default-src 'self'",
		// React needs eval in development only, for its error stacks
		`script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`,
		"style-src 'self' 'unsafe-inline'",
		"img-src 'self' blob: data:",
		"font-src 'self' data:",
		`connect-src 'self'${reportsTo ? ` ${reportsTo}` : ''}`,
		`frame-src 'self'${framesFrom ? ` ${framesFrom}` : ''}`,
		"object-src 'none'",
		"base-uri 'self'",
		"form-action 'self'",
		"frame-ancestors 'none'",
		'report-uri /api/csp-report',
	].join('; ');
}

// 16 random bytes, new for every page request
export function createNonce(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(16));
	return btoa(String.fromCharCode(...bytes));
}
