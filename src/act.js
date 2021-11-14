import { cloneCube } from './clone-cube';
import { printDiffs } from './cube-diff';
import { displayCube } from './display-cube';
import { movements } from './movements';
import { clear } from './terminal-output';

/* showSteps = 'all' | 'summary' | 'none' */
export const act = (cube, showSteps, steps, showColors, showPreviousCube) => {
	// console.log(Array.from(steps));
	const firstCube = showPreviousCube && showSteps !== 'none' ? cloneCube(cube) : undefined;
	let previousCube = firstCube;

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
			displayCube(cube, showColors);

			if (showPreviousCube)
				printDiffs(previousCube, cube);
		} else if (showSteps === 'summary' && i === steps.length - 1) {
			clear('Movements: ' + steps);
			displayCube(cube, showColors);

			if (showPreviousCube)
				printDiffs(firstCube, cube);
		}

		previousCube = showPreviousCube && showSteps !== 'none' ? cloneCube(cube) : undefined;
	}
};
