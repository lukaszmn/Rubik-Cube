import { act } from './act';
import { cloneCube } from './clone-cube';

/* example:
const options = [
	{ name: 'run', movements: "RUR'URUUR" },
	{ name: 'right', movements: 'y'' },
	{ name: 'left', movements: 'y' },
	{ name: '180deg', movements: 'yy' },
];
*/

export const solve = (startCube, targetCube, options, maxSteps) => {
	let steps = [{
		path: '',
		cube: cloneCube(startCube),
		previousCubes: [],
	}];

	const solutions = [];
	const targetInOneLineRegex = new RegExp('^' + toOneLine(targetCube).replace('-', '.') + '$');

	while (maxSteps-- >= 0 && solutions.length === 0) {
		const newSteps = [];

		for (const step of steps) {
			for (const option of options) {

				const newCube = cloneCube(step.cube);
				act(newCube, 'none', option.movements);

				const newStep = {
					path: step.path + ' ' + option.name,
					cube: newCube,
					previousCubes: [...step.previousCubes, toOneLine(step.cube)],
				};

				const inOneLine = toOneLine(newCube);
				if (newStep.previousCubes.includes(inOneLine))
					continue;

				newSteps.push(newStep);

				if (targetInOneLineRegex.test(inOneLine))
					solutions.push(newStep);
			}
		}

		steps = newSteps;
	}

	return solutions;
};

const toOneLine = cube => Object.getOwnPropertyNames(cube)
	.sort()
	.map(key => cube[key])
	.reduce((prev, curr) => [...prev, ...curr])
	.reduce((prev, curr) => [...prev, ...curr])
	.join('');
