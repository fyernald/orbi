'use client';

import { betaAccess, type RedeemBetaKeyInput } from '@orbi/shared';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

// the access comes from the server with the page (getServerBetaAccess), so the
// key page only needs to send the key
export function useRedeemBetaKey() {
	return useMutation({
		mutationFn: (input: RedeemBetaKeyInput) =>
			api.post('/beta/redeem', betaAccess, input),
	});
}
