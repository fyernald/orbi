import { QueryClient } from '@tanstack/react-query';
import { isClientError } from './api';

export function createQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60_000,
				refetchOnWindowFocus: false,
				retry: (failureCount, error) =>
					!isClientError(error) && failureCount < 1,
			},
		},
	});
}
