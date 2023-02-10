import { STATE } from './data/state';

/**
 * @param {string} steps
 * @return {string}
 */
export const movUserToKey = steps => steps.replace(/'/, '_');

/**
 * @param {string} steps
 * @return {string}
 */
export const movKeyToUser = steps => steps.replace(/_/, "'");

/**
 * Returns movements in reverse order with reverse steps, e.g. "RU'D" -> "D'UR'"
 * @param {string} steps
 * @return {string}
 */
export const reverseMovements = steps => {
	let res = '';
	for (let i = steps.length - 1; i >= 0; --i) {
		if (steps[i] === "'") continue;
		res += steps[i];
		if (steps[i] === ' ')
			continue;

		const isReverse = (i + 1 < steps.length && steps[i + 1] === "'");
		if (!isReverse)
			res += "'";
	}
	return res;
};

/**
 * @param {string} steps
 * @return {string}
 */
export const expandMovements = steps => {
	let res = '';

	for (let i = 0; i < steps.length; ++i) {
		const mov = steps[i];
		if (mov === "'") continue;
		const isReverse = (i + 1 < steps.length && steps[i + 1] === "'");

		const savedRecordingForKey = STATE.savedRecordings.find(x => x.key === mov);
		if (!savedRecordingForKey) {
			res += mov;
			if (isReverse)
				res += "'";
		}	else {
			if (!isReverse)
				res += savedRecordingForKey.movements;
			else
				res += reverseMovements(savedRecordingForKey.movements);
		}
	}

	return res;
};

/**
 * @param {string} steps
 * @return {number[]}
 */
export const getStepNumberToStringIndexMap = steps => {
	const map = [];

	let stepNumber = 0;
	steps = movKeyToUser(steps);
	for (let stringIndex = 0; stringIndex < steps.length; ++stringIndex) {
		const c = steps[stringIndex];
		if (c === '_' || c === "'" || c === ' ')
			continue;
		map[stepNumber] = stringIndex;
		++stepNumber;
	}

	return map;
};
