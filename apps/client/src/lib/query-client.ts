import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './api';

// a 4xx answer (not found, not allowed) will not change by asking again
const isClientError = (error: unknown) =>
	error instanceof ApiError && error.status >= 400 && error.status < 500;

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
