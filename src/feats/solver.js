import { act } from '../act';
import { toCube, toOneLine } from '../cube-utils/cube-converters';
import * as CubeTypes from '../cube-utils/identifier-cube';
import { getIdentifierCube } from '../cube-utils/identifier-cube';
import * as StateTypes from '../data/state';

/* example:
const options = [
	{ name: 'run', movements: "RUR'URUUR" },
	{ name: 'right', movements: 'y'' },
	{ name: 'left', movements: 'y' },
	{ name: '180deg', movements: 'yy' },
];
loggers: { step: (step, solutionsCount, queueSize)=>{}, progress: percent=>{}, stepSolutions: newSolutionsCount=>{} }
*/

/** @type {NodeJS.HRTime[]} */
export const timers = [];

/** @param {string} index */
const _start = index => {
	timers[index] = timers[index] || 0;
	timers['t-_' + index] = process.hrtime();
};

/** @param {string} index */
const _end = index => {
	timers[index] += process.hrtime(timers['t-_' + index])[1] / 1000000.0;
	delete timers['t-_' + index];
};


/**
 * @param {CubeTypes.Cube} startCube
 * @param {CubeTypes.Cube} targetCube
 * @param {StateTypes.OptimizeOption[]} options
 * @param {number} maxSteps
 * @param {Loggers} loggers
 * @return {SolverSolution[]}
 */
export const solve = (startCube, targetCube, options, maxSteps, loggers) => {
	/** @type {SolverStep[]} */
	let steps = [{
		path: '',
		cubeArr: Array.from(toOneLine(startCube)),
		cubeStr: toOneLine(startCube),
		// previousCubes: [],
	}];

	const maxLength = 140;
	const allPreviousCubes = {};

	_start('0 cacheMovements');
	const movementsCache = cacheMovements(options);
	_end('0 cacheMovements');

	/** @type {SolverSolution[]} */
	const solutions = [];
	const targetInOneLineRegex = new RegExp('^' + toOneLine(targetCube).replace(/-/g, '.') + '$');
	// const targetInOneLine = toOneLine(targetCube);

	let stepNumber = 0;
	while (++stepNumber <= maxSteps) {
		_start('1 loggers.step');
		if (loggers.step)
			loggers.step(stepNumber, solutions.length, steps.length);
		_end('1 loggers.step');

		/** @type {SolverStep[]} */
		const newSteps = [];

		let newSolutionsCounter = 0;
		let stepCounter = 0;
		let totalStepCounter = 0;

		for (const step of steps) {
			for (let optionIndex = 0; optionIndex < options.length; ++optionIndex) {
			// for (const option of options) {
				const option = options[optionIndex];

				_start('2 000 11 222');
				// 000 11 222 33 444 55
				if (false && step.path.length > 0 && +step.path[step.path.length - 1] === optionIndex) {
					if (optionIndex === 1 || optionIndex === 3 || optionIndex === 5) {
						_end('2 000 11 222');
						continue;
					}
					if ((optionIndex === 0 || optionIndex === 2 || optionIndex === 4)
						&& step.path.length > 1 && +step.path[step.path.length - 2] === optionIndex
					) {
						_end('2 000 11 222');
						continue;
					}
				}
				_end('2 000 11 222');

				_start('3 cacheTransform');
				const newCubeArr = cacheTransform(movementsCache, step.cubeArr, option.name);
				_end('3 cacheTransform');
				_start('4 newCubeArr.join');
				const newCubeStr = newCubeArr.join('');
				// console.log(step.cube, option.name, newCube);

				const newPath = step.path + optionIndex;
				_end('4 newCubeArr.join');

				_start('5 if stepNumber<maxSteps');
				if (stepNumber !== maxSteps) {
					_start('31 create newStep');
					/** @type {SolverStep} */
					const newStep = {
						path: newPath,
						cubeArr: newCubeArr,
						cubeStr: newCubeStr,
						// previousCubes: [...step.previousCubes, step.cube],
					};
					_end('31 create newStep');

					_start('32 exists newCubeStr');
					const res = allPreviousCubes[newCubeStr];
					_end('32 exists newCubeStr');
					// if (newStep.previousCubes.includes(newCube))
					if (res) {
						_end('5 if stepNumber<maxSteps');
						continue;
					}

					_start('33 push newStep');
					newSteps.push(newStep);
					_end('33 push newStep');
					_start('34 add newCubeStr field');
					allPreviousCubes[newCubeStr] = true;
					_end('34 add newCubeStr field');
				}
				_end('5 if step<maxSteps');

				_start('6 regex');
				const res = targetInOneLineRegex.test(newCubeStr);
				_end('6 regex');
				if (res) {
				// if (targetInOneLine === newCube) {
					_start('7 solution');
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
					_end('7 solution');
				}
			}

			// @ts-ignore
			step.path = undefined;
			// @ts-ignore
			step.cubeArr = undefined;
			// @ts-ignore
			step.cubeStr = undefined;
			// step.previousCubes = undefined;

			_start('8 loggers.progress');
			++totalStepCounter;
			if (++stepCounter === 10000 && loggers.progress) {
				stepCounter = 0;
				loggers.progress(Math.round(100.0 * totalStepCounter / steps.length), newSolutionsCounter);
			}
			_end('8 loggers.progress');
		}

		_start('9 loggers.stepSolutions');
		if (newSolutionsCounter > 0 && loggers.stepSolutions)
			loggers.stepSolutions(newSolutionsCounter);
		_end('9 loggers.stepSolutions');

		_start('10 steps=newSteps.filter');
		if (stepNumber < maxSteps) {
			steps = newSteps.filter(step => {
				const indicesPath = Array.from(step.path);
				const length = indicesPath
					.map(index => options[+index].movements)
					.join('')
					.replace(/ /g, '').length;
				return length <= maxLength;
			});
		}
		_end('10 steps=newSteps.filter');
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
	const cube = getIdentifierCube();
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

	_start('20 cacheTransform: clone');
	const after = [];
	for (let i = 0, l = cubeOneLineArray.length; i < l; ++i)
		after[i] = cubeOneLineArray[i];
	_end('20 cacheTransform: clone');

	_start('21 cacheTransform: edit');
	for (const t of transform)
		after[t[0]] = cubeOneLineArray[t[1]];
	_end('21 cacheTransform: edit');
	return after;
};

// cacheMovements([{name: 'R', movements: 'R'}]);
// console.log(movementsCache);
// console.log(cacheTransform(before, 'R'));

// process.exit();

/**
 * @typedef SolverStep
 * @property {string} path
 * @property {string[]} cubeArr
 * @property {string} cubeStr
 */

/**
 * @typedef SolverSolution
 * @property {string} path
 * @property {number} length
 * @property {CubeTypes.Cube} cube
 */

/**
 * @typedef Loggers
 * @property {LoggersStepCallback} step
 * @property {LoggersProgressCallback} progress
 * @property {LoggersStepSolutionsCallback} stepSolutions
 */
/**
 * @callback LoggersStepCallback
 * @param {number} step
 * @param {number} solutionsCount
 * @param {number} queueSize
 */
/**
 * @callback LoggersProgressCallback
 * @param {number} percent
 * @param {number} newSolutionsCount
 */
/**
 * @callback LoggersStepSolutionsCallback
 * @param {number} newSolutionsCount
 */
