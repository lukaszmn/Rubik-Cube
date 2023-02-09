import { STATE } from './state';

export const movUserToKey = steps => steps.replace(/'/, '_');
export const movKeyToUser = steps => steps.replace(/_/, "'");

export const reverseMovements = steps => {
	let res = '';
	for (let i = steps.length - 1; i >= 0; --i) {
		if (steps[i] === "'") continue;
		res += steps[i];
		const isReverse = (i + 1 < steps.length && steps[i + 1] === "'");
		if (!isReverse)
			res += "'";
	}
	return res;
};

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
