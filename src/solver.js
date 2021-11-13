import { act } from './act';
import { cloneCube } from './clone-cube';

/* example:
const options = [
	{ name: 'run', movements: "RUR'URUUR" },
	{ name: 'right', movements: 'y'' },
	{ name: 'left', movements: 'y' },
	{ name: '180deg', movements: 'yy' },
];
loggers: { step: (step, solutionsCount, queueSize)=>{}, progress: percent=>{}, stepSolutions: newSolutionsCount=>{} }
*/

export const solve = (startCube, targetCube, options, maxSteps, loggers) => {
	let steps = [{
		path: '',
		cube: toOneLine(startCube),
		// previousCubes: [],
	}];

	const maxLength = 40;
	const allPreviousCubes = {};

	const movementsCache = cacheMovements(options);

	const solutions = [];
	const targetInOneLineRegex = new RegExp('^' + toOneLine(targetCube).replace('-', '.') + '$');
	// const targetInOneLine = toOneLine(targetCube);

	let step = 0;
	while (++step <= maxSteps) {
		if (loggers.step)
			loggers.step(step, solutions.length, steps.length);
		const newSteps = [];

		let newSolutionsCounter = 0;
		let stepCounter = 0;
		let totalStepCounter = 0;

		for (const step of steps) {
			for (let optionIndex = 0; optionIndex < options.length; ++optionIndex) {
			// for (const option of options) {
				const option = options[optionIndex];

				// 000 11 222 33 444 55
				if (step.path.length > 0 && +step.path[step.path.length - 1] === optionIndex) {
					if (optionIndex === 1 || optionIndex === 3 || optionIndex === 5)
						continue;
					if ((optionIndex === 0 || optionIndex === 2 || optionIndex === 4) && step.path.length > 1 && +step.path[step.path.length - 2] === optionIndex)
						continue;
				}

				const newCube = cacheTransform(movementsCache, step.cube, option.name);
				// console.log(step.cube, option.name, newCube);

				const newPath = step.path + optionIndex;

				if (step !== maxSteps) {
					const newStep = {
						path: newPath,
						cube: newCube,
						// previousCubes: [...step.previousCubes, step.cube],
					};

					// if (newStep.previousCubes.includes(newCube))
					if (allPreviousCubes[newCube])
						continue;

					newSteps.push(newStep);
					allPreviousCubes[newCube] = true;
				}

				if (targetInOneLineRegex.test(newCube)) {
				// if (targetInOneLine === newCube) {
					const indicesPath = Array.from(newPath);
					const path = indicesPath
						.map(index => options[+index].name)
						.join(' ');
					const length = indicesPath
						.map(index => options[+index].movements)
						.join('')
						.replace(/ /g, '').length;
					solutions.push({
						path: path,
						length: length,
						cube: toCube(newCube),
					});
					++newSolutionsCounter;
				}
			}

			step.path = undefined;
			step.cube = undefined;
			// step.previousCubes = undefined;

			++totalStepCounter;
			if (++stepCounter === 10000 && loggers.progress) {
				stepCounter = 0;
				loggers.progress(Math.round(100.0 * totalStepCounter / steps.length), newSolutionsCounter);
			}
		}

		if (newSolutionsCounter > 0 && loggers.stepSolutions)
			loggers.stepSolutions(newSolutionsCounter);

		if (step < maxSteps) {
			steps = newSteps.filter(step => {
				const indicesPath = Array.from(step.path);
				const length = indicesPath
					.map(index => options[+index].movements)
					.join('')
					.replace(/ /g, '').length;
				return length <= maxLength;
			});
		}
	}

	return solutions;
};

const toOneLine = cube => [cube.U, cube.L, cube.F, cube.R, cube.B, cube.D]
	.reduce((prev, curr) => [...prev, ...curr])
	.reduce((prev, curr) => [...prev, ...curr])
	.join('');

const toCube = oneLine => {
	const getRow = (face, index) => Array.from(face.substr(index * 3, 3));
	const getFace = (line, index) => {
		const face = line.substr(index * 9, 9);
		return [ getRow(face, 0), getRow(face, 1), getRow(face, 2) ];
	};

	return {
		U: getFace(oneLine, 0),
		L: getFace(oneLine, 1),
		F: getFace(oneLine, 2),
		R: getFace(oneLine, 3),
		B: getFace(oneLine, 4),
		D: getFace(oneLine, 5),
	};
};


const cacheMovements = options => {
	const movementsCache = {}; // movement => transform
	for (const option of options)
		cacheMovement(movementsCache, option.name, option.movements);

	return movementsCache;
};

const cacheMovement = (movementsCache, name, movements) => {
	let i = 0;
	const getChar = i => '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'[i];
	const makeRow = () => [getChar(i++), getChar(i++), getChar(i++)];
	const makeFace = () => [ makeRow(), makeRow(), makeRow() ];
	const cube = {
		U: makeFace(),
		L: makeFace(),
		F: makeFace(),
		R: makeFace(),
		B: makeFace(),
		D: makeFace(),
	};
	const before = toOneLine(cube);
	act(cube, 'none', movements);
	const after = toOneLine(cube);
	// console.log(before);
	// console.log(after);

	const transform = [];
	for (let afterIndex = 0; afterIndex < after.length; ++afterIndex) {
		const beforeIndex = before.indexOf(after[afterIndex]);
		if (afterIndex !== beforeIndex)
			transform.push([afterIndex, beforeIndex]);
	}
	// console.log(transform);
	movementsCache[name] = transform;

	const after2 = Array.from(before);
	for (const t of transform)
		after2[t[0]] = before[t[1]];
	const after2String = after2.join('');
	// console.log(after2String, after2String === after);
	if (after2String !== after)
		throw new Error('Failed to cache movements: ' + movements);
};

const cacheTransform = (movementsCache, cubeOneLine, movementName) => {
	const transform = movementsCache[movementName];

	const after = Array.from(cubeOneLine);
	for (const t of transform)
		after[t[0]] = cubeOneLine[t[1]];
	return after.join('');
}

// cacheMovements([{name: 'R', movements: 'R'}]);
// console.log(movementsCache);
// console.log(cacheTransform(before, 'R'));

// process.exit();
