'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useState, type ReactNode } from 'react';
import { createQueryClient } from '@/lib/query-client';
import { z } from 'zod';

// Zod would try eval once to see if it can compile faster checks, which the
// Content-Security-Policy does not allow; it works the same without
z.config({ jitless: true });

export function Providers({
	children,
	nonce,
}: {
	children: ReactNode;
	// for the theme script, which runs before React
	nonce: string | undefined;
}) {
	// one client per browser tab, created once
	const [queryClient] = useState(createQueryClient);

	return (
		// follows the system setting until the student picks light or dark;
		// no colour transitions while switching, so the page changes at once
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			disableTransitionOnChange
			nonce={nonce}
		>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</ThemeProvider>
	);
}
