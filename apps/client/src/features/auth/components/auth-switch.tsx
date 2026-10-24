import Link from 'next/link';

type AuthSwitchProps = {
	prompt: string;
	href: string;
	label: string;
};

// "No account yet? Sign up" under the form
export function AuthSwitch({ prompt, href, label }: AuthSwitchProps) {
	return (
		<p className="text-sm text-muted-foreground">
			{prompt}{' '}
			<Link
				href={href}
				className="font-medium text-foreground underline underline-offset-4"
			>
				{label}
			</Link>
		</p>
	);
}
