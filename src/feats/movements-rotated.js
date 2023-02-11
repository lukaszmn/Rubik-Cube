import { actSilent } from '../act';
import { toOneLine } from '../cube-utils/cube-converters';
import { getIdentifierCube } from '../cube-utils/identifier-cube';
import { movements } from '../movements';
import { expandMovements, movKeyToUser, reverseMovements } from '../movements-utils';

/**
 * @param {string} rotations
 * @param {string} step - single character
 * @return {string | undefined}
 */
export const getMovementForRotations = (rotations, step) => {
	if (step.length !== 1)
		throw new Error('Pass only 1 movement');

	const expected = getIdentifierCube();
	actSilent(expected, step);
	const expectedS = toOneLine(expected);

	const rotationsReverse = reverseMovements(rotations);

	for (const name of Object.getOwnPropertyNames(movements)) {
		const actual = getIdentifierCube();
		const name1 = movKeyToUser(name);
		actSilent(actual, rotations + name1 + rotationsReverse);
		const actualS = toOneLine(actual);
		if (actualS === expectedS)
			return name1;
	}

	return undefined;
};

/**
 * @param {string} rotations
 * @param {string} steps
 * @return {string}
 */
export const getMovementsForRotations = (rotations, steps) => {
	const stepsExpanded = expandMovements(steps);
	const movArr = Array.from(stepsExpanded);
	const movRotated = movArr
		.map(c => (c === "'" || c === ' ') ? c : getMovementForRotations(rotations, c))
		.join('');
	const movWithoutDoubleApostrophe = movRotated.replace(/''/g, '');
	return movWithoutDoubleApostrophe;
};
