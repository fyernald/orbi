import { parse } from 'acorn';

// An endless loop must not hang the mini-app (US-42, point 18). Chrome runs the
// sandbox in a process of its own, so the chat page stays responsive and closes a
// frozen frame, but not every browser does. So before the code runs, every loop
// body calls a guard, and a loop that keeps the page busy for too long throws.

export const LOOP_GUARD_NAME = '__orbiLoopGuard';
export const LOOP_LIMIT_MS = 2000;

const LOOP_TYPES = new Set([
	'ForStatement',
	'ForInStatement',
	'ForOfStatement',
	'WhileStatement',
	'DoWhileStatement',
]);

type SyntaxNode = { type: string; start: number; end: number };

const isNode = (value: unknown): value is SyntaxNode =>
	typeof value === 'object' &&
	value !== null &&
	typeof (value as SyntaxNode).type === 'string' &&
	typeof (value as SyntaxNode).start === 'number';

// the body of every loop in the tree, nested ones too
function loopBodies(node: SyntaxNode, found: SyntaxNode[] = []) {
	if (LOOP_TYPES.has(node.type)) {
		found.push((node as SyntaxNode & { body: SyntaxNode }).body);
	}
	for (const value of Object.values(node)) {
		const children: unknown[] = Array.isArray(value) ? value : [value];
		for (const child of children) if (isNode(child)) loopBodies(child, found);
	}
	return found;
}

// The code with each loop body wrapped as { __orbiLoopGuard(); body }. A body
// without braces is wrapped the same way, so it stays one statement. Code that
// does not parse is left as it is: running it reports the syntax error.
export function guardLoops(source: string): string {
	let program: SyntaxNode;
	try {
		program = parse(source, { ecmaVersion: 'latest', sourceType: 'script' });
	} catch {
		return source;
	}
	const edits = loopBodies(program)
		.flatMap(({ start, end }) => [
			{ at: start, text: `{${LOOP_GUARD_NAME}();` },
			{ at: end, text: '}' },
		])
		.sort((first, second) => second.at - first.at);
	let guarded = source;
	for (const { at, text } of edits) {
		guarded = guarded.slice(0, at) + text + guarded.slice(at);
	}
	return guarded;
}

// The guard the loops call. The page "breathes" every time the browser gets to run
// a timer; a loop that has kept it from doing so for LOOP_LIMIT_MS is stopped.
export function createLoopGuard(now: () => number = Date.now) {
	let lastBreath = now();
	return {
		breathe() {
			lastBreath = now();
		},
		check() {
			if (now() - lastBreath > LOOP_LIMIT_MS) {
				throw new Error(
					`A loop ran for over ${LOOP_LIMIT_MS / 1000} seconds without a break, so it was stopped.`
				);
			}
		},
	};
}

const BREATH_EVERY_MS = 250;

// puts the guard on the page and keeps it breathing while the page is free
export function installLoopGuard() {
	const guard = createLoopGuard();
	const breathe = () => {
		guard.breathe();
		setTimeout(breathe, BREATH_EVERY_MS);
	};
	breathe();
	Object.assign(window, { [LOOP_GUARD_NAME]: guard.check });
	return guard;
}
