import { movUserToKey, reverseMovements } from '../src/movements-utils';

console.log('Testing movements-utils');

const reverseMovementsTests = () => {
	const cases = [
		["RU'D", "D'UR'"],
		['A B', "B' A'"],
		["RU' y D", "D' y' UR'"],
	];
	for (const [data, expected] of cases) {
		const actual = reverseMovements(data);
		if (actual !== expected)
			throw new Error(`reverseMovements("${data}") should be "${expected}" but was "${actual}"`);
	}
};

const movUserToKeyTests = () => {
	const cases = [
		['RUD', 'RUD'],
		["RU'D", 'RU_D'],
		["RU' D'", 'RU_ D_'],
	];
	for (const [data, expected] of cases) {
		const actual = movUserToKey(data);
		if (actual !== expected)
			throw new Error(`movUserToKey("${data}") should be "${expected}" but was "${actual}"`);
	}
};

reverseMovementsTests();
movUserToKeyTests();

console.log('  -> OK');
