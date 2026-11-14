// A small, safe formula language for function plots (US-42): numbers, the
// variables a visual allows (x for a plot), pi and e, + - * / ^, brackets and a
// short list of maths and statistics functions. It is read into a tree and worked
// out with plain JavaScript maths, never eval, so the server can check a formula
// with the same code the browser draws it with.

import { erf, normalCdf, normalPdf } from './statistics';

export const FORMULA_MAX_LENGTH = 200;

type MathFunction = (...args: number[]) => number;

// name -> [function, smallest number of arguments, largest]. Maps, not objects,
// so a name like "constructor" finds nothing.
const functions = new Map<string, [MathFunction, number, number]>(
	Object.entries({
		sin: [Math.sin, 1, 1],
		cos: [Math.cos, 1, 1],
		tan: [Math.tan, 1, 1],
		asin: [Math.asin, 1, 1],
		acos: [Math.acos, 1, 1],
		atan: [Math.atan, 1, 1],
		sinh: [Math.sinh, 1, 1],
		cosh: [Math.cosh, 1, 1],
		tanh: [Math.tanh, 1, 1],
		sqrt: [Math.sqrt, 1, 1],
		cbrt: [Math.cbrt, 1, 1],
		abs: [Math.abs, 1, 1],
		exp: [Math.exp, 1, 1],
		ln: [Math.log, 1, 1],
		log: [Math.log, 1, 1],
		log10: [Math.log10, 1, 1],
		log2: [Math.log2, 1, 1],
		floor: [Math.floor, 1, 1],
		ceil: [Math.ceil, 1, 1],
		round: [Math.round, 1, 1],
		sign: [Math.sign, 1, 1],
		min: [Math.min, 2, 8],
		max: [Math.max, 2, 8],
		erf: [erf, 1, 1],
		// (x), (x, mean) or (x, mean, sd)
		normpdf: [normalPdf, 1, 3],
		normcdf: [normalCdf, 1, 3],
	})
);

const constants = new Map([
	['pi', Math.PI],
	['e', Math.E],
]);

export const FORMULA_FUNCTION_NAMES = [...functions.keys()];

export type FormulaScope = Readonly<Record<string, number>>;
export type Formula = (scope: FormulaScope) => number;

export type FormulaResult =
	{ ok: true; evaluate: Formula } | { ok: false; problem: string };

type Token =
	| { kind: 'number'; value: number }
	| { kind: 'name'; value: string }
	| { kind: 'symbol'; value: string };

class FormulaProblem extends Error {}

const NUMBER = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/;
const NAME = /^[a-zA-Z_]\w*/;
const SYMBOLS = ['**', '+', '-', '*', '/', '^', '(', ')', ','];

function readTokens(source: string): Token[] {
	const tokens: Token[] = [];
	let rest = source;
	while (rest) {
		const space = /^\s+/.exec(rest);
		if (space) {
			rest = rest.slice(space[0].length);
			continue;
		}
		const number = NUMBER.exec(rest);
		if (number) {
			tokens.push({ kind: 'number', value: Number(number[0]) });
			rest = rest.slice(number[0].length);
			continue;
		}
		const name = NAME.exec(rest);
		if (name) {
			tokens.push({ kind: 'name', value: name[0] });
			rest = rest.slice(name[0].length);
			continue;
		}
		const symbol = SYMBOLS.find((item) => rest.startsWith(item));
		if (!symbol) {
			throw new FormulaProblem(
				`"${rest[0]}" cannot be used. Write formulas with numbers, + - * / ^, brackets and functions like sin(x).`
			);
		}
		tokens.push({ kind: 'symbol', value: symbol === '**' ? '^' : symbol });
		rest = rest.slice(symbol.length);
	}
	return tokens;
}

// how tightly each operator holds its sides; a missing operator between two
// values (2x, 3(x+1)) is a multiplication
const binding: Record<string, number> = {
	'+': 1,
	'-': 1,
	'*': 2,
	'/': 2,
	'^': 4,
};
const UNARY_BINDING = 3;

const operators: Record<string, (left: number, right: number) => number> = {
	'+': (left, right) => left + right,
	'-': (left, right) => left - right,
	'*': (left, right) => left * right,
	'/': (left, right) => left / right,
	'^': (left, right) => left ** right,
};

// Reads the tokens into a function, operator by operator (a Pratt parser).
function createReader(tokens: Token[], variables: readonly string[]) {
	let position = 0;
	const peek = () => tokens[position];
	const next = () => tokens[position++];
	const isSymbol = (token: Token | undefined, value: string) =>
		token?.kind === 'symbol' && token.value === value;
	const expect = (value: string, problem: string) => {
		if (!isSymbol(next(), value)) throw new FormulaProblem(problem);
	};

	// a value can start here, so a missing operator means multiply
	const startsValue = (token: Token | undefined) =>
		token !== undefined && (token.kind !== 'symbol' || token.value === '(');

	function readCall(name: string): Formula {
		const entry = functions.get(name);
		if (!entry) {
			throw new FormulaProblem(
				`Unknown function "${name}". Use one of: ${FORMULA_FUNCTION_NAMES.join(', ')}.`
			);
		}
		const [run, fewest, most] = entry;
		next();
		const args: Formula[] = [];
		if (!isSymbol(peek(), ')')) {
			args.push(readExpression(0));
			while (isSymbol(peek(), ',')) {
				next();
				args.push(readExpression(0));
			}
		}
		expect(')', `Close the brackets of ${name}(…).`);
		if (args.length < fewest || args.length > most) {
			const count = fewest === most ? `${fewest}` : `${fewest} to ${most}`;
			throw new FormulaProblem(`${name} takes ${count} values.`);
		}
		return (scope) => run(...args.map((arg) => arg(scope)));
	}

	function readName(name: string): Formula {
		// x(x + 1) multiplies, so names come before function calls
		if (variables.includes(name)) return (scope) => scope[name] ?? Number.NaN;
		const constant = constants.get(name);
		if (constant !== undefined) return () => constant;
		if (isSymbol(peek(), '(')) return readCall(name);
		if (functions.has(name)) {
			throw new FormulaProblem(`Write ${name}(…) with brackets.`);
		}
		throw new FormulaProblem(
			`Unknown name "${name}". Use ${[...variables, 'pi', 'e'].join(', ')} and put * between names (2*x*y).`
		);
	}

	function readValue(): Formula {
		const token = next();
		if (!token) throw new FormulaProblem('The formula ends too early.');
		if (token.kind === 'number') return () => token.value;
		if (token.kind === 'name') return readName(token.value);
		if (token.value === '(') {
			const inner = readExpression(0);
			expect(')', 'Close every bracket you open.');
			return inner;
		}
		if (token.value === '-' || token.value === '+') {
			const operand = readExpression(UNARY_BINDING);
			return token.value === '-' ? (scope) => -operand(scope) : operand;
		}
		throw new FormulaProblem(`"${token.value}" is in the wrong place.`);
	}

	function readExpression(minimum: number): Formula {
		let left = readValue();
		for (;;) {
			const token = peek();
			const implicit = startsValue(token);
			const operator = implicit
				? '*'
				: token?.kind === 'symbol'
					? token.value
					: undefined;
			const strength = operator ? binding[operator] : undefined;
			if (!operator || strength === undefined || strength <= minimum) break;
			if (!implicit) next();
			// ^ groups from the right: 2^3^2 is 2^(3^2)
			const right = readExpression(operator === '^' ? strength - 1 : strength);
			const run = operators[operator]!;
			const current = left;
			left = (scope) => run(current(scope), right(scope));
		}
		return left;
	}

	return {
		read(): Formula {
			const formula = readExpression(0);
			const left = peek();
			if (left) {
				throw new FormulaProblem(`"${left.value}" is in the wrong place.`);
			}
			return formula;
		},
	};
}

// The formula as a function of the given variables, or what is wrong with it in
// words the AI can fix.
export function compileFormula(
	source: string,
	variables: readonly string[] = ['x']
): FormulaResult {
	const text = source.trim();
	if (!text) return { ok: false, problem: 'The formula is empty.' };
	if (text.length > FORMULA_MAX_LENGTH) {
		return {
			ok: false,
			problem: `Keep a formula under ${FORMULA_MAX_LENGTH} characters.`,
		};
	}
	try {
		return {
			ok: true,
			evaluate: createReader(readTokens(text), variables).read(),
		};
	} catch (error) {
		if (error instanceof FormulaProblem) {
			return { ok: false, problem: error.message };
		}
		throw error;
	}
}
