import { MODE, STATE } from '../../data/state';
import * as SolverTypes from '../../feats/solver';
import { solve } from '../../feats/solver';
import { displayCube } from './display-cube';
import { questionAsync } from './question';

export const solverInterface = async () => {
	if (!STATE.optimize) throw new Error('Optmize is not set');
	console.log('Now enter possible movements, one per line.');

	/* eslint quotes: "off" */
	STATE.optimize.options = [
		// { name: 'up', movements: "x" },
		// { name: 'down', movements: "x'" },
		{ name: 'left', movements: "y" },		// 0
		{ name: 'right', movements: "y'" },	// 1
		{ name: '2right', movements: "yy" },// 2
		// { name: 'FRU', movements: "FRU R'U'F'" },
		// { name: 'FRU2', movements: "FUR U'R'F'" },
		// { name: 'RUR', movements: "RUR'U RUUR'" },
		// { name: 'rogi', movements: "RB' RFFR' BR FFRR" },
		// { name: 'koniec-lewo', movements: "FFU LR' FF L'R UFF" },
		// { name: 'koniec-prawo', movements: "FFU' LR' FF L'R U'FF" },
		// { name: 'RH', movements: "RUR'U'" },
		// { name: 'LH', movements: "L'U'LU" },
		{ name: 'R', movements: "R" },		// 3
		{ name: "R'", movements: "R'" },	// 4
		{ name: 'U', movements: "U" },		// 5
		{ name: "U'", movements: "U'" },	// 6
		{ name: 'L', movements: "L" },		// 7
		{ name: "L'", movements: "L'" },	// 8
		{ name: 'F', movements: "F" },		// 9
		{ name: "F'", movements: "F'" },	// 10
		{ name: 'B', movements: "B" },		// 11
		{ name: "B'", movements: "B'" },	// 12
	];

	while (true) {
		console.log();
		const name = await questionAsync('Type movement name (empty answer to finish): ');
		if (name === '') {
			await showMaxStepsInterface();
			showAndSolve();
			return;
		}

		let movements = '';
		while (!movements)
			movements = await questionAsync('Type movements (UDLRFB udlrfb MES xyz): ');

		STATE.optimize.options.push({ name, movements });
	}
};

const showMaxStepsInterface = async () => {
	if (!STATE.optimize) throw new Error('Optmize is not set');
	console.log();
	const maxSteps = await questionAsync('How many repetitions should be performed at most? ');
	STATE.optimize.maxSteps = maxSteps;
};

const showAndSolve = () => {
	if (!STATE.optimize) throw new Error('Optmize is not set');
	showSummary();

	/** @type {SolverTypes.Loggers} */
	const loggers = {
		step: (step, solutionsCount, queueSize) => console.log(
			`Permutations for step ${step} out of ${STATE.optimize.maxSteps} ` +
			`(total solutions ${solutionsCount}, current queue size ${queueSize})`
		),
		progress: (percent, newSolutionsCounter) => console.log(`  ${percent}% (new solutions: ${newSolutionsCounter})`),
		stepSolutions: newSolutionsCounter => console.log(`  Found new ${newSolutionsCounter} solution(s)`),
		duration: durationSecond => console.log(`Time: ${durationSecond} seconds`),
	};

	console.time('test');
	const solutions = solve(STATE.optimize.source, STATE.optimize.target, STATE.optimize.options, STATE.optimize.maxSteps, loggers);
	console.timeEnd('test');

	showSolution(solutions);

	STATE.needsClearScreen = true;
	STATE.mode = MODE.BROWSE;
};

const showSummary = () => {
	if (!STATE.optimize) throw new Error('Optmize is not set');
	console.log();
	console.log('Summary:');
	console.log('Initial cube:');
	displayCube(STATE.optimize.source, undefined, true);
	console.log('Target cube:');
	displayCube(STATE.optimize.target, undefined, true);
	console.log('Options:');
	for (const option of STATE.optimize.options)
		console.log(`  ${option.name}: ${option.movements}`);
	console.log(`Max repetitions: ${STATE.optimize.maxSteps}`);
};

const showSolution = solutions => {
	console.log();

	if (solutions.length === 0) {
		console.log('No solution found');
		return;
	}

	console.log(`Found ${solutions.length} solutions`);
	console.log();
	for (const solution of solutions) {
		console.log(`Solution of length ${solution.length} for path: ${solution.path}`);
		// displayCube(solution.cube, undefined, true);
	}
};
