// The markdown renderer only reads $$...$$ as maths, so "$5 and $10" stays money.
// Models still write maths in other ways; this turns them into $$...$$ first.

// a single $...$ is maths when the text right inside both dollars is not a space and
// the closing one is not followed by a digit (Pandoc's rule): "$n$", "$2^n = 8$",
// but not "$5 and $10"
const SINGLE_DOLLAR = /(?<![\\$])\$(?=\S)([^$\n]+?)(?<=\S)\$(?![$\d])/g;
// \( ... \) inline, and \[ ... \] on its own lines
const PAREN_MATH = /\\\(([\s\S]+?)\\\)/g;
const BRACKET_MATH = /\\\[([\s\S]+?)\\\]/g;
// fenced code blocks (also one still being written) and inline code stay as they are
const CODE = /(```[\s\S]*?(?:```|$)|`[^`\n]*`)/g;

function normalizeText(text: string): string {
	return text
		.replace(BRACKET_MATH, (_, math: string) => `\n$$\n${math.trim()}\n$$\n`)
		.replace(PAREN_MATH, (_, math: string) => `$$${math.trim()}$$`)
		.replace(SINGLE_DOLLAR, (_, math: string) => `$$${math}$$`);
}

export function normalizeMath(markdown: string): string {
	if (!markdown.includes('$') && !markdown.includes('\\')) return markdown;
	return markdown
		.split(CODE)
		.map((part, index) => (index % 2 === 1 ? part : normalizeText(part)))
		.join('');
}
