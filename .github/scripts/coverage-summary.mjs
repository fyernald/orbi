// Prints the test coverage of each app and package as a Markdown table, for the
// summary of the CI run. Reads coverage/coverage-summary.json from pnpm test:coverage.
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const file = 'coverage/coverage-summary.json';
if (!existsSync(file)) {
	console.log('No coverage report: the tests did not finish.');
	process.exit(0);
}

const report = JSON.parse(readFileSync(file, 'utf8'));
const metrics = ['lines', 'branches', 'functions'];
const areas = new Map();

for (const [name, totals] of Object.entries(report)) {
	if (name === 'total') continue;
	const parts = path.relative(process.cwd(), name).split(path.sep);
	const area = parts.slice(0, 2).join('/');
	const sum =
		areas.get(area) ??
		Object.fromEntries(metrics.map((m) => [m, { covered: 0, total: 0 }]));
	for (const metric of metrics) {
		sum[metric].covered += totals[metric].covered;
		sum[metric].total += totals[metric].total;
	}
	areas.set(area, sum);
}

const percent = ({ covered, total }) =>
	total === 0 ? '-' : `${((covered / total) * 100).toFixed(1)}%`;

console.log('### Test coverage\n');
console.log('| Where | Lines | Branches | Functions |');
console.log('| --- | --- | --- | --- |');
for (const [area, sum] of [...areas].sort()) {
	console.log(
		`| \`${area}\` | ${metrics.map((m) => percent(sum[m])).join(' | ')} |`
	);
}
