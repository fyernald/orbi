import { APP_NAME } from '@orbi/shared';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { cookies, headers } from 'next/headers';
import type { ReactNode } from 'react';
import { browserBarColors } from '@/lib/browser-bar';
import { TITLE_TEMPLATE } from '@/lib/page-title';
import { PALETTE_COOKIE, readPalette } from '@/lib/palette';
import { cn } from '@/lib/utils';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
	title: { default: APP_NAME, template: TITLE_TEMPLATE },
	description: 'Personal AI Study Coach',
};

// the colour theme the student picked, from its cookie
async function palette() {
	return readPalette((await cookies()).get(PALETTE_COOKIE)?.value);
}

export async function generateViewport(): Promise<Viewport> {
	const colors = browserBarColors[await palette()];
	return {
		themeColor: [
			{ media: '(prefers-color-scheme: light)', color: colors.light },
			{ media: '(prefers-color-scheme: dark)', color: colors.dark },
		],
	};
}

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
			data-palette={await palette()}
			suppressHydrationWarning
		>
			<body>
				<Providers nonce={nonce}>{children}</Providers>
			</body>
		</html>
	);
}
