import type { CSSProperties, ReactNode } from 'react';

type AuthCardProps = {
	title: string;
	description: string;
	footer: ReactNode;
	children: ReactNode;
};

const stagger = (order: number) => ({ '--stagger': order }) as CSSProperties;

// the heading, form, and footer of the login and sign-up pages; they come in one
// after another when the page opens
export function AuthCard({
	title,
	description,
	footer,
	children,
}: AuthCardProps) {
	return (
		<div className="flex flex-col gap-8">
			<header className="flex flex-col gap-2">
				<h1
					style={stagger(0)}
					className="stagger-in text-3xl font-semibold tracking-tight text-balance"
				>
					{title}
				</h1>
				<p
					style={stagger(1)}
					className="stagger-in text-pretty text-muted-foreground"
				>
					{description}
				</p>
			</header>
			<div style={stagger(2)} className="stagger-in">
				{children}
			</div>
			<div style={stagger(3)} className="stagger-in">
				{footer}
			</div>
		</div>
	);
}
