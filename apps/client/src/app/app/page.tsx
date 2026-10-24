import { APP_NAME } from '@orbi/shared';
import { CurrentUser } from '@/features/auth/components/current-user';
import { SignOutButton } from '@/features/auth/components/sign-out-button';

// placeholder home at /app until the course list (US-02) lives here
export default function HomePage() {
	return (
		<main className="mx-auto flex max-w-2xl flex-col gap-4 p-6">
			<h1 className="text-2xl font-semibold">{APP_NAME}</h1>
			<CurrentUser />
			<div>
				<SignOutButton />
			</div>
		</main>
	);
}
