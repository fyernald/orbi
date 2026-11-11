import { Script } from 'node:vm';

// What is wrong with the syntax of the model's JavaScript, or undefined. The code
// is only compiled, never run: building a Script parses it and stops there. The
// sandbox in the browser runs it.
export function jsSyntaxProblem(source: string): string | undefined {
	try {
		new Script(source, { filename: 'mini-app.js' });
		return undefined;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		return `The js has a syntax error: ${message}. Fix it and call the tool again.`;
	}
}
