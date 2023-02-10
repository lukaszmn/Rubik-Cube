import { printDiffs } from './cube-diff';
import { cloneCube } from './cube-utils/clone-cube';
import * as CubeTypes from './cube-utils/identifier-cube';
import { DIFF_MODE, STATE } from './data/state';
import { movements } from './movements';
import { movementsAnimated } from './movements-animated';
import { expandMovements, movKeyToUser } from './movements-utils';
import { alertError, displayCurrentCube, redrawWithTitle } from './ui/ui';

/**
 * @param {CubeTypes.Cube} cube
 * @param {'all' | 'summary' | 'none'} showSteps
 * @param {string} steps
 */
export const act = async (cube, showSteps, steps) => {
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
			alertError(`Invalid movement "${mov}" in "${steps}"`);
			return;
		}

		const visibleMovement = movKeyToUser(mov);

		if (STATE.animationSpeed > 0 && showSteps !== 'none') {
			const anim = movementsAnimated[mov](cube);
			for (let animIndex = 0; animIndex < anim.length; ++animIndex) {
				const cubeAnim = anim[animIndex];

				if (showSteps === 'all') {
					redrawWithTitle('Movement: ' + visibleMovement);
					displayCurrentCube({ animate: cubeAnim });

					printDiffs(previousCube, cubeAnim);
				} else if (showSteps === 'summary' && i === steps.length - 1) {
					redrawWithTitle('Movements: ' + steps);
					displayCurrentCube({ animate: cubeAnim });

					printDiffs(firstCube, cubeAnim);
				}

				await sleep(STATE.animationSpeed);
			}
		} else {
			if (showSteps === 'all') {
				redrawWithTitle('Movement: ' + visibleMovement);
				displayCurrentCube({ animate: cube });

				printDiffs(previousCube, cube);
			} else if (showSteps === 'summary' && i === steps.length - 1) {
				redrawWithTitle('Movements: ' + steps);
				displayCurrentCube({ animate: cube });

				printDiffs(firstCube, cube);
			}
		}

		movements[mov](cube);

		previousCube = showPreviousCube ? cloneCube(cube) : undefined;
	}
};

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
