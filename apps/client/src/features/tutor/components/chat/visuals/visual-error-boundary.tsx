'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

type VisualErrorBoundaryProps = {
	// shown in place of a visual that broke while drawing; reset draws it again
	fallback: (reset: () => void) => ReactNode;
	children: ReactNode;
};

// A visual that throws while it draws shows its error card, never a blank box,
// and the rest of the reply keeps working.
export class VisualErrorBoundary extends Component<
	VisualErrorBoundaryProps,
	{ failed: boolean }
> {
	state = { failed: false };

	static getDerivedStateFromError() {
		return { failed: true };
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		console.warn('A visual could not be drawn.', error, info.componentStack);
	}

	reset = () => this.setState({ failed: false });

	render() {
		return this.state.failed
			? this.props.fallback(this.reset)
			: this.props.children;
	}
}
