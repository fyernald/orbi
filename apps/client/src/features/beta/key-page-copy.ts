import type { BetaAccess } from '@orbi/shared';

type KeyPageCopy = { title: string; description: string };

// a student who never used a key, or one whose 30 days are over
export function keyPageCopy({ endsAt }: BetaAccess): KeyPageCopy {
	if (endsAt === null) {
		return {
			title: 'Enter your beta key',
			description:
				'Orbi is in a closed beta. Enter the key we sent you to get 30 days of access.',
		};
	}
	return {
		title: 'Your access has ended',
		description:
			'Your beta access is over. Your courses and notes are still here: enter a new key to keep studying.',
	};
}
