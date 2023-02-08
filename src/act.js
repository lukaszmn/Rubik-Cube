import { cloneCube } from './clone-cube';
import { printDiffs } from './cube-diff';
import { displayCube } from './display-cube';
import { movements } from './movements';
import { DIFF_MODE, STATE } from './state';
import { clear } from './terminal-output';

/* showSteps = 'all' | 'summary' | 'none' */
export const act = (cube, showSteps, steps) => {
	const showPreviousCube = STATE.showDiff !== DIFF_MODE.NONE && showSteps !== 'none';

	const firstCube = showPreviousCube ? cloneCube(cube) : undefined;
	let previousCube = firstCube;

	steps = expandMovements(steps);

	for (let i = 0; i < steps.length; ++i) {
		let mov = steps[i];
		if (mov === ' ')
			continue;

		if (i + 1 < steps.length && steps[i + 1] === "'") {
			++i;
			mov += '_';
		}

		if (!movements[mov]) {
			console.log(`ERROR: invalid movement "${mov}" in "${steps}"`);
			return;
		}
		movements[mov](cube);

		if (showSteps === 'all') {
			clear('Movement: ' + mov);
			displayCube(cube, undefined, true);

			printDiffs(previousCube, cube);
		} else if (showSteps === 'summary' && i === steps.length - 1) {
			clear('Movements: ' + steps);
			displayCube(cube, undefined, true);

			printDiffs(firstCube, cube);
		}

		previousCube = showPreviousCube ? cloneCube(cube) : undefined;
	}
};

const expandMovements = steps => {
	let res = '';

	for (let i = 0; i < steps.length; ++i) {
		const mov = steps[i];
		if (mov === "'") continue;
		const reverse = (i + 1 < steps.length && steps[i + 1] === "'");

		const savedRecordingForKey = STATE.savedRecordings.find(x => x.key === mov);
		if (!savedRecordingForKey) {
			res += mov;
		}	else {
			if (!reverse) {
				res += savedRecordingForKey.movements;
			} else {
				const steps2 = savedRecordingForKey.movements;
				for (let j = steps2.length - 1; j >= 0; --j) {
					if (steps2[j] === "'") continue;
					const reverse2 = (j + 1 < steps2.length && steps2[j + 1] === "'");
					res += steps2[j];
					if (!reverse2)
						res += "'";
				}
			}
		}
	}

	return res;
};
