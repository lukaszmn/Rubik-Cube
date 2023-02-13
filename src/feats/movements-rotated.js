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

/**
 * @param {string} steps
 * @return {string}
 */
export const getRotationless = steps => {
	// find first occurrence of x/y/z
	const positions = ['x', 'y', 'z'].map(c => steps.indexOf(c)).filter(i => i !== -1);
	if (positions.length === 0)
		return steps;

	const pos = Math.min(...positions);
	const len = (pos + 1 < steps.length && steps[pos + 1] === "'") ? 2 : 1;

	const stepsLeft = steps.slice(0, pos).trimEnd();
	const reverseRotation = steps[pos] + (len === 1 ? "'" : '');
	const stepsRight = getRotationless(steps.slice(pos + len));
	const stepsRightRotationless = getMovementsForRotations(reverseRotation, stepsRight);
	// console.log({steps, stepsLeft, reverseRotation, stepsRight, stepsRightRotationless});
	return stepsLeft + stepsRightRotationless;
};
