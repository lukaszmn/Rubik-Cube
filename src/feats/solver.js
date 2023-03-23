import { act } from '../act';
import { toCube, toOneLine } from '../cube-utils/cube-converters';
import * as CubeTypes from '../cube-utils/identifier-cube';
import { getIdentifierCube } from '../cube-utils/identifier-cube';
import * as StateTypes from '../data/state';
import { reverseMovements } from '../movements-utils';

/* example:
const options = [
	{ name: 'run', movements: "RUR'URUUR" },
	{ name: 'right', movements: 'y'' },
	{ name: 'left', movements: 'y' },
	{ name: '180deg', movements: 'yy' },
];
loggers: { step: (step, solutionsCount, queueSize)=>{}, progress: percent=>{}, stepSolutions: newSolutionsCount=>{} }
*/

/** @type {bigint[]} Key: string, value: bigint */
export const timers = [];
// PERFORMANCE: process.hrtime called thousands times takes a lot of time! Exclude them in production
let timersInTimersStart = BigInt(0);
let timersInTimersEnd = BigInt(0);

/** @param {string} index */
const _start = index => {
	// const _time = process.hrtime.bigint();
	timers[index] = timers[index] || BigInt(0);
	timers['t-_' + index] = process.hrtime.bigint();
	// timersInTimersStart += process.hrtime.bigint() - _time;
};

/** @param {string} index */
const _end = index => {
	// const _time = process.hrtime.bigint();
	timers[index] += process.hrtime.bigint() - timers['t-_' + index];
	delete timers['t-_' + index];
	// timersInTimersEnd += process.hrtime.bigint() - _time;
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
	let stepsFront = [{
		path: '',
		cubeArr: stringLineToNumberArray(toOneLine(startCube)),
		// previousCubes: [],
	}];
	let stepsBack = [{
		path: '',
		cubeArr: stringLineToNumberArray(toOneLine(targetCube)),
		// previousCubes: [],
	}];

	const maxLength = 140;
	const allPreviousCubesFront = {};
	const allPreviousCubesBack = {};

	//_start('0 cacheMovements');
	const movementsCache = cacheMovements(options);
	//_end('0 cacheMovements');

	/** @type {SolverSolution[]} */
	const solutions = [];
	const targetInOneLine = toOneLine(targetCube);
	const targetInOneLineRegex = new RegExp('^' + targetInOneLine.replace(/-/g, '.') + '$');
	const targetNumbers = stringLineToNumberArray(targetInOneLine);
	const targetHashCode = numberArrayToHashCode(targetNumbers);
	const containsAnyCells = targetInOneLine.includes('-');
	const target = {
		containsAnyCells, targetInOneLineRegex, targetHashCode, targetNumbers
	};
	// PERFORMANCE - suggestion: store as array of bytes, but much more complex transforms
	// -0 B1 R2 G3 O4 W5 Y6 -> 3 bits per cell
	// there are 9*6 = 54 cells. Require 162 bits, or 21 bytes

	const startTime = process.hrtime.bigint();

	let stepNumber = 0;
	while (++stepNumber <= maxSteps) {
		//_start('1 loggers.step');
		if (loggers.step)
			loggers.step(stepNumber, solutions.length, stepsFront.length);
		//_end('1 loggers.step');

		let newSolutionsCounter = 0;
		let stepCounter = 0;
		let totalStepCounter = 0;

		const newStepsFront = [];
		for (const step of stepsFront) {
			const { newSolutionsCount } = solveStep(options, movementsCache, step, newStepsFront, stepNumber === maxSteps, allPreviousCubesFront, target, solutions, [], false);

			newSolutionsCounter += newSolutionsCount;

			//_start('8 loggers.progress');
			++totalStepCounter;
			if (++stepCounter === 10000 && loggers.progress) {
				stepCounter = 0;
				loggers.progress(Math.round(100.0 * totalStepCounter / (stepsFront.length + stepsBack.length)), newSolutionsCounter);
			}
			//_end('8 loggers.progress');
		}

		const newStepsBack = [];
		for (const step of stepsBack) {
			const { newSolutionsCount } = solveStep(options, movementsCache, step, newStepsBack, stepNumber === maxSteps, allPreviousCubesBack, target, solutions, allPreviousCubesFront, true);

			newSolutionsCounter += newSolutionsCount;

			//_start('8 loggers.progress');
			++totalStepCounter;
			if (++stepCounter === 10000 && loggers.progress) {
				stepCounter = 0;
				loggers.progress(Math.round(100.0 * totalStepCounter / (stepsFront.length + stepsBack.length)), newSolutionsCounter);
			}
			//_end('8 loggers.progress');
		}

		//_start('9 loggers.stepSolutions');
		if (newSolutionsCounter > 0 && loggers.stepSolutions)
			loggers.stepSolutions(newSolutionsCounter);
		//_end('9 loggers.stepSolutions');

		stepsFront = newStepsFront;
		stepsBack = newStepsBack;
		// why was that?
		/*
		//_start('10 steps=newSteps.filter');
		if (stepNumber < maxSteps) {
			steps = newSteps.filter(step => {
				const indicesPath = step.path.split(',');
				const length = indicesPath
					.map(index => options[+index].movements)
					.join('')
					.replace(/ /g, '').length;
				return length <= maxLength;
			});
		}
		//_end('10 steps=newSteps.filter');
		*/

		if (newSolutionsCounter > 0)
			break;
	}

	timers['0 timers in timers start'] = timersInTimersStart;
	timers['0 timers in timers end'] = timersInTimersEnd;

	const endTime = process.hrtime.bigint();
	const durationSeconds = Number((endTime - startTime) / 1000000000n);
	if (loggers.duration)
		loggers.duration(durationSeconds);

	return solutions;
};

/**
 * @param {StateTypes.OptimizeOption[]} options
 * @param {SolverStep} step
 * @param {SolverStep[]} newSteps
 * @param {boolean} isLastStep
 * @param {any} allPreviousCubes: cubeHash -> SolverStep
 * @param {SolverSolution[]} solutions
 * @param {any} allPreviousCubesOpposite: cubeHash -> SolverStep
 */
function solveStep(options, movementsCache, step, newSteps, isLastStep, allPreviousCubes, target, solutions, allPreviousCubesOpposite, isBack) {
	let newSolutionsCount = 0;

	for (let optionIndex = 0; optionIndex < options.length; ++optionIndex) {
		// for (const option of options) {
		const option = options[optionIndex];

		if (false) {
			//_start('2 000 11 222');
			// 000 11 222 33 444 55
			if (step.path.length > 0 && +step.path[step.path.length - 1] === optionIndex) {
				if (optionIndex === 1 || optionIndex === 3 || optionIndex === 5) {
					//_end('2 000 11 222');
					continue;
				}
				if ((optionIndex === 0 || optionIndex === 2 || optionIndex === 4)
					&& step.path.length > 1 && +step.path[step.path.length - 2] === optionIndex
				) {
					//_end('2 000 11 222');
					continue;
				}
			}
			//_end('2 000 11 222');
		}

		//_start('3 cacheTransform');
		const newCubeArr = cacheTransform(movementsCache, step.cubeArr, option.name);
		// V8 aggressively optimizes functions called many times, so calling cacheTransform() instead of inlining it is faster
		//_end('3 cacheTransform');

		//_start('4 newCubeArr.join');
		// console.log(step.cube, option.name, newCube);

		const newPath = step.path.length === 0 ? '' + optionIndex : step.path + ',' + optionIndex;
		//_end('4 newCubeArr.join');

		//_start('4.5 hash');
		const newHash = numberArrayToHashCode(newCubeArr);
		//_end('4.5 hash');

		//_start('5 if stepNumber<maxSteps');
		if (!isLastStep) {
			//_start(' 51 create newStep');
			/** @type {SolverStep} */
			const newStep = {
				path: newPath,
				cubeArr: newCubeArr,
				// previousCubes: [...step.previousCubes, step.cube],
			};
			//_end(' 51 create newStep');

			//_start(' 52 exists newCubeStr');
			const res = allPreviousCubes[newHash];
			//_end(' 52 exists newCubeStr');
			// if (newStep.previousCubes.includes(newCube))
			if (res) {
				if (res.some(x => compareArrays(x.cubeArr, newCubeArr))) {
					//_end('5 if stepNumber<maxSteps');
					continue;
				}

				//_start(' 54a add newCubeStr field');
				res.push(newStep);
				//_end(' 54a add newCubeStr field');
			} else {
				//_start(' 54b add newCubeStr field');
				allPreviousCubes[newHash] = [newStep];
				//_end(' 54b add newCubeStr field');
			}

			//_start(' 53 push newStep');
			newSteps.push(newStep);
			//_end(' 53 push newStep');
		}
		//_end('5 if stepNumber<maxSteps');

		//_start('6 regex');
		const success = isBack
			? false
			: target.containsAnyCells
				? target.targetInOneLineRegex.test(numberArrayToStringLine(newCubeArr))
				: target.targetHashCode === newHash && compareArrays(target.targetNumbers, newCubeArr);
		//_end('6 regex');

		if (success) {
			//_start('7 solution');
			const indicesPath = newPath.split(',');
			const path = indicesPath
				.map(index => options[+index].name)
				.join(' ');
			const length = indicesPath
				.map(index => options[+index].movements)
				.join('')
				.replace(/[ ']/g, '').length;
			solutions.push({
				path: path,
				length: length,
				cube: toCube(numberArrayToStringLine(newCubeArr)),
			});
			++newSolutionsCount;
			//_end('7 solution');
		}

		if (isBack) {
			//_start('8 back-front check');
			const res = allPreviousCubesOpposite[newHash];
			if (res) {
				const oppositeStep = res.find(x => compareArrays(x.cubeArr, newCubeArr));
				if (oppositeStep) {
					//_start(' 81 solution');

					const indicesPathFront = newPath.split(',');
					const pathFront = indicesPathFront
						.map(index => options[+index].name)
						.join(' ');
					const movementsFront = indicesPathFront
						.map(index => options[+index].movements)
						.join(' ');

					const indicesPathBack = oppositeStep.path.split(',');
					let movementsBack = reverseMovements(indicesPathBack
						.map(index => options[+index].movements)
						.join(' ')
					);
					const movementsBackOrig = movementsBack;
					// console.log({indicesPathFront, pathFront, indicesPathBack,
					// 	indicesPathBack2: indicesPathBack.map(index => options[+index].movements).join(' '), movementsBack});

					let pathBack = '';
					const sortedOptions = options.sort((a, b) => a.movements.length - b.movements.length);
					while (movementsBack.length > 0) {
						movementsBack = movementsBack.trim();
						let found = false;

						for (const opt of sortedOptions) {
							// find movements regardless of whitespaces - create a regex that includes spaces between any character
							const pattern = '^' + opt.movements.replace(/ /g, '').split('').map(c => '\\s*' + c).join('');
							const re = new RegExp(pattern);
							const reRes = re.exec(movementsBack);
							if (reRes) {
								const match = reRes[0];
								// but also cannot leave \s*' at the end
								if (movementsBack.substring(match.length).trimStart().startsWith("'"))
									continue;
								pathBack += ' ' + opt.name;
								movementsBack = movementsBack.substring(match.length);
								found = true;
								break;
							}
						}

						if (!found) {
							// add char, including '
							const len = (movementsBack.length > 1 && movementsBack[1] === "'") ? 2 : 1;
							pathBack += ' ' + movementsBack.substring(0, len);
							movementsBack = movementsBack.substring(len);
						}
					}

					const path = pathFront + pathBack;
					const length = (movementsFront + movementsBackOrig).replace(/[ ']/g, '').length;
					solutions.push({
						path: path,
						length: length,
						cube: toCube(numberArrayToStringLine(newCubeArr)),
					});
					++newSolutionsCount;
					//_end(' 81 solution');
				}
			}
			//_end('8 back-front check');
		}
	}

	// @ts-ignore
	// step.path = undefined;
	// @ts-ignore
	// step.cubeArr = undefined;
	// step.previousCubes = undefined;

	return { newSolutionsCount };
}

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

function cacheTransform(movementsCache, cubeOneLineArray, movementName) {
	//_start(' 30 cacheTransform: get');
	const transform = movementsCache[movementName];
	//_end(' 30 cacheTransform: get');

	//_start(' 30 cacheTransform: clone');
	const after = cubeOneLineArray.slice();
	//_end(' 30 cacheTransform: clone');

	//_start(' 31 cacheTransform: edit');
	for (const t of transform)
		after[t[0]] = cubeOneLineArray[t[1]];
	//_end(' 31 cacheTransform: edit');

	return after;
};

/**
 * Converts one-line cube that contains letters 'W', 'G' to array of numbers
 * @param {string} cubeLine
 * @return {number[]}
 */
function stringLineToNumberArray(cubeLine) {
	const MAP = { '-': 0, 'W': 1, 'Y': 2, 'R': 3, 'G': 4, 'B': 5, 'O': 6 };
	return Array.from(cubeLine).map(c => MAP[c]);
}

/**
 * Converts array of numbers cube to one-line cube that contains letters 'W', 'G'
 * @param {number[]} cubeArr
 * @return {string}
 */
function numberArrayToStringLine(cubeArr) {
	const MAP = Array.from('-WYRGBO');
	return cubeArr.map(c => MAP[c]).join('');
}

/**
 * Gets "hash code" for array of numbers cube
 * @param {number[]} cubeArr
 * @return {number}
 */
function numberArrayToHashCode(cubeArr) {
	let h = 0;
	let i = cubeArr.length;
	while (i--)
		h = Math.imul(31, h) + cubeArr[i] | 0;

  return h;
}

/**
 * Checks if two arrays of same length are equal. Note that the length is not checked!
 * @param {number[]} arr1
 * @param {number[]} arr2
 * @return {boolean}
 */
function compareArrays(arr1, arr2) {
	let i = arr1.length;
	while (i--)
		if (arr1[i] !== arr2[i]) return false;
	return true;
}

// cacheMovements([{name: 'R', movements: 'R'}]);
// console.log(movementsCache);
// console.log(cacheTransform(before, 'R'));

// process.exit();

/**
 * @typedef SolverStep
 * @property {string} path
 * @property {number[]} cubeArr
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
 * @property {LoggersDurationCallback} duration
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
/**
 * @callback LoggersDurationCallback
 * @param {number} durationSeconds
 */
