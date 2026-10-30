import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
	title: { default: 'Orbi', template: '%s · Orbi' },
	description: 'Personal AI Study Coach',
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		// the theme script sets the dark class before React loads, so the server's html differs
		<html
			lang="en"
			className={cn('font-sans', inter.variable)}
			suppressHydrationWarning
		>
			<body>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
