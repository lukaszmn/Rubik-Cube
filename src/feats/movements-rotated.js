import { act } from '../act';
import { toOneLine } from '../cube-utils/cube-converters';
import { getIdentifierCube } from '../cube-utils/identifier-cube';
import { movements } from '../movements';
import { expandMovements, movKeyToUser, reverseMovements } from '../movements-utils';

/**
 * @param {string} rotations
 * @param {string} step - single character
 * @return {Promise<string | undefined>}
 */
export const getMovementForRotations = async (rotations, step) => {
	if (step.length !== 1)
		throw new Error('Pass only 1 movement');

	const expected = getIdentifierCube();
	await act(expected, 'none', step);
	const expectedS = toOneLine(expected);

	const rotationsReverse = reverseMovements(rotations);

	for (const name of Object.getOwnPropertyNames(movements)) {
		const actual = getIdentifierCube();
		const name1 = movKeyToUser(name);
		await act(actual, 'none', rotations + name1 + rotationsReverse);
		const actualS = toOneLine(actual);
		if (actualS === expectedS)
			return name1;
	}

	return undefined;
};

/**
 * @param {string} rotations
 * @param {string} steps
 * @return {Promise<string>}
 */
export const getMovementsForRotations = async (rotations, steps) => {
	const stepsExpanded = expandMovements(steps);
	const movArr = Array.from(stepsExpanded);
	const movRotated = (await Promise.all(movArr
		.map(async c => (c === "'" || c === ' ') ? c : await getMovementForRotations(rotations, c))
	)).join('');
	const movWithoutDoubleApostrophe = movRotated.replace(/''/g, '');
	return movWithoutDoubleApostrophe;
};
