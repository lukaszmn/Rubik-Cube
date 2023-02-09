import { act } from './act';
import { toOneLine } from './cube-utils/cube-converters';
import { getIdentifierCube } from './cube-utils/identifier-cube';
import { movements } from './movements';
import { expandMovements, movKeyToUser, reverseMovements } from './movements-utils';

export const getMovementForRotations = (rotations, step) => {
	if (step.length !== 1)
		throw new Error('Pass only 1 movement');

	const expected = getIdentifierCube();
	act(expected, 'none', step);
	const expectedS = toOneLine(expected);

	const rotationsReverse = reverseMovements(rotations);

	for (const name of Object.getOwnPropertyNames(movements)) {
		const actual = getIdentifierCube();
		const name1 = movKeyToUser(name);
		act(actual, 'none', rotations + name1 + rotationsReverse);
		const actualS = toOneLine(actual);
		if (actualS === expectedS)
			return name1;
	}

	return undefined;
};

export const getMovementsForRotations = (rotations, steps) => {
	const stepsExpanded = expandMovements(steps);
	const movArr = Array.from(stepsExpanded);
	const movRotated = movArr
		.map(c => c === "'" ? "'" : getMovementForRotations(rotations, c))
		.join('');
	const movWithoutDoubleApostrophe = movRotated.replace(/''/, '');
	return movWithoutDoubleApostrophe;
};
