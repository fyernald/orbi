import { redirect } from 'next/navigation';
import { routes } from '@/lib/routes';

// the landing page will live here; until then, go to the app
export default function LandingPage() {
	redirect(routes.app);
}
