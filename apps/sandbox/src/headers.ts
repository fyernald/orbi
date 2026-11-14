// The headers every sandbox response carries. The page runs code the AI wrote, so
// the policy lets it draw and nothing else: no network (connect-src 'none'), no
// forms, no other frames, and only Orbi may embed it. The sandbox directive keeps
// it sandboxed even when someone opens the address on its own.
export function contentSecurityPolicy(appOrigin: string): string {
	return [
		"default-src 'none'",
		// the mini-app's own code is an inline script; libraries come from here
		"script-src 'self' 'unsafe-inline'",
		"style-src 'self' 'unsafe-inline'",
		'img-src data: blob:',
		'font-src data:',
		'media-src data: blob:',
		"connect-src 'none'",
		"form-action 'none'",
		"base-uri 'none'",
		`frame-ancestors ${appOrigin}`,
		'sandbox allow-scripts',
	].join('; ');
}

// what a mini-app may not use, even if it asks the student
const BLOCKED_FEATURES = [
	'camera',
	'microphone',
	'geolocation',
	'payment',
	'usb',
	'serial',
	'bluetooth',
	'display-capture',
	'clipboard-read',
];

export function securityHeaders(appOrigin: string): Record<string, string> {
	return {
		'Content-Security-Policy': contentSecurityPolicy(appOrigin),
		'Permissions-Policy': BLOCKED_FEATURES.map((name) => `${name}=()`).join(
			', '
		),
		'Referrer-Policy': 'no-referrer',
		'X-Content-Type-Options': 'nosniff',
	};
}
