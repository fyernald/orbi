import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
	title: 'Orbi',
	description: 'Personal AI Study Coach',
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" className={cn('font-sans', inter.variable)}>
			<body>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
