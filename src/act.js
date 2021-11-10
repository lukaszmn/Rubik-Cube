import { displayCube } from './display-cube';
import { movements } from './movements';
import { clear } from './terminal-output';

export const act = (cube, showSteps, steps) => {
	// console.log(Array.from(steps));
	for (let i = 0; i < steps.length; ++i) {
		let mov = steps[i];
		if (i + 1 < steps.length && steps[i + 1] === "'") {
			++i;
			mov += '_';
		}
		movements[mov](cube);
		if (showSteps) {
			clear('Movement: ' + mov);
			displayCube(cube);
		} else if (i === steps.length - 1) {
			clear('Movements: ' + steps);
			displayCube(cube);
		}
	}
};
