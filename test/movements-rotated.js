import { getRotationless } from '../src/feats/movements-rotated';

console.log('Testing movements-rotated');

const cases = [
	['B', 'B'],
	[" U RUR'U' y L'U'LU y'", " U RUR'U' F'U'FU"],
	[" U RUR'U' y L'U'LU y' ", " U RUR'U' F'U'FU "]
];
for (const [data, expected] of cases) {
	const actual = getRotationless(data);
	if (actual !== expected)
		throw new Error(`getRotationless("${data}") should be "${expected}" but was "${actual}"`);
}

console.log('  -> OK');
