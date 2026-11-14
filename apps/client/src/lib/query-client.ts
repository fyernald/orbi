import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { ApiError, isClientError } from './api';
import { routes } from './routes';

// Beta access can end while the app is open. The next request then answers 403, and
// a full load of the key page lets its server layout decide what to show.
function onAccessEnded(error: unknown) {
	if (error instanceof ApiError && error.code === 'beta_access_required') {
		window.location.assign(routes.betaKey);
	}
}

export function createQueryClient() {
	return new QueryClient({
		queryCache: new QueryCache({ onError: onAccessEnded }),
		mutationCache: new MutationCache({ onError: onAccessEnded }),
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
