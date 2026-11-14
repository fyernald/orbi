import { Compass } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { tourRoute } from '@/lib/routes';

// the tour of the app again (US-46), on Home where it points at things
export function TourSettingsCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Tour of Orbi</CardTitle>
				<CardDescription>
					A short look at courses, notes, the tutor and review. It takes about a
					minute.
				</CardDescription>
			</CardHeader>
			<CardFooter>
				<Button asChild variant="outline">
					<Link href={tourRoute}>
						<Compass />
						Take the tour
					</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
