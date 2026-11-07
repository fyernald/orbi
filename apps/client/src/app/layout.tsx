import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';
import { APP_NAME, TITLE_TEMPLATE } from '@/lib/page-title';
import { cn } from '@/lib/utils';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
	title: { default: APP_NAME, template: TITLE_TEMPLATE },
	description: 'Personal AI Study Coach',
};

// the browser bar on phones takes the page's background (--background in globals.css)
export const viewport: Viewport = {
	themeColor: [
		{ media: '(prefers-color-scheme: light)', color: '#fcf9fa' },
		{ media: '(prefers-color-scheme: dark)', color: '#140d10' },
	],
};

// the nonce of this request's Content-Security-Policy, set by proxy.ts
async function cspNonce() {
	const policy =
		(await headers()).get('content-security-policy-report-only') ?? '';
	return policy.match(/'nonce-([^']+)'/)?.[1];
}

export default async function RootLayout({
	children,
}: {
	children: ReactNode;
}) {
	const nonce = await cspNonce();
	return (
		// the theme script sets the dark class before React loads, so the server's html differs
		<html
			lang="en"
			className={cn('font-sans', inter.variable)}
			suppressHydrationWarning
		>
			<body>
				<Providers nonce={nonce}>{children}</Providers>
			</body>
		</html>
	);
}
