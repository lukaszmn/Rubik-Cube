import { reverseMovements } from '../src/movements-utils';

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

reverseMovementsTests();
