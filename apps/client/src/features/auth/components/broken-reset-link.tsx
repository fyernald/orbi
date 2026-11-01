import { LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { routes } from '@/lib/routes';
import { authButton } from '../styles';
import { AuthNotice } from './auth-notice';

export function BrokenResetLink() {
	return (
		<AuthNotice
			icon={LinkIcon}
			title="This link does not work"
			action={
				<Button asChild className={authButton}>
					<Link href={routes.forgotPassword}>Get a new link</Link>
				</Button>
			}
		>
			The link has expired or was already used. Links work for one hour.
		</AuthNotice>
	);
}
