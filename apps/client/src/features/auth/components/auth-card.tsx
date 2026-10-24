import type { ReactNode } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

type AuthCardProps = {
	title: string;
	description: string;
	footer: ReactNode;
	children: ReactNode;
};

// the frame around the login and sign-up forms; restyle it here when the designs are ready
export function AuthCard({
	title,
	description,
	footer,
	children,
}: AuthCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent>{children}</CardContent>
			<CardFooter>{footer}</CardFooter>
		</Card>
	);
}
