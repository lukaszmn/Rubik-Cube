import { act } from './act';
import { toCube, toOneLine } from './cube-converters';

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
		cubeArr: Array.from(toOneLine(startCube)),
		cubeStr: toOneLine(startCube),
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

				const newCubeArr = cacheTransform(movementsCache, step.cubeArr, option.name);
				const newCubeStr = newCubeArr.join('');
				// console.log(step.cube, option.name, newCube);

				const newPath = step.path + optionIndex;

				if (step !== maxSteps) {
					const newStep = {
						path: newPath,
						cubeArr: newCubeArr,
						cubeStr: newCubeStr,
						// previousCubes: [...step.previousCubes, step.cube],
					};

					// if (newStep.previousCubes.includes(newCube))
					if (allPreviousCubes[newCubeStr])
						continue;

					newSteps.push(newStep);
					allPreviousCubes[newCubeStr] = true;
				}

				if (targetInOneLineRegex.test(newCubeStr)) {
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
						cube: toCube(newCubeStr),
					});
					++newSolutionsCounter;
				}
			}

			step.path = undefined;
			step.cubeArr = undefined;
			step.cubeStr = undefined;
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

const cacheTransform = (movementsCache, cubeOneLineArray, movementName) => {
	const transform = movementsCache[movementName];

	const after = [];
	for (var i = 0, l = cubeOneLineArray.length; i < l; ++i)
	after[i] = cubeOneLineArray[i];

	for (const t of transform)
		after[t[0]] = cubeOneLineArray[t[1]];
	return after;
}

// cacheMovements([{name: 'R', movements: 'R'}]);
// console.log(movementsCache);
// console.log(cacheTransform(before, 'R'));

// process.exit();
