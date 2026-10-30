'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useState, type ReactNode } from 'react';
import { createQueryClient } from '@/lib/query-client';

export function Providers({ children }: { children: ReactNode }) {
	// one client per browser tab, created once
	const [queryClient] = useState(createQueryClient);

	return (
		// follows the system setting until the student picks light or dark;
		// no colour transitions while switching, so the page changes at once
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			disableTransitionOnChange
		>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</ThemeProvider>
	);
}
