import { displayCube } from './display-cube';
import { questionAsync } from './question';
import { solve } from './solver';
import { MODE, STATE } from './state';

export const solverInterface = async () => {
	console.log('Now enter possible movements, one per line.');
	STATE.optimize.options = [];

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

		STATE.optimize.options.push({name, movements});
	}
};

const showMaxStepsInterface = async () => {
	console.log();
	const maxSteps = await questionAsync('How many repetitions should be performed at most? ');
	STATE.optimize.maxSteps = maxSteps;
};

const showAndSolve = () => {
	showSummary();
	const solutions = solve(STATE.optimize.source, STATE.optimize.target, STATE.optimize.options, STATE.optimize.maxSteps);
	showSolution(solutions);

	STATE.needsClearScreen = true;
	STATE.mode = MODE.BROWSE;
};

const showSummary = () => {
	console.log();
	console.log('Summary:');
	console.log('Initial cube:');
	displayCube(STATE.optimize.source);
	console.log('Target cube:');
	displayCube(STATE.optimize.target);
	console.log('Options:');
	for (const option of STATE.optimize.options)
		console.log(`  ${option.name}: ${option.movements}`);
	console.log(`Max repetitions: ${STATE.optimize.maxSteps}`);
};

const showSolution = (solutions) => {
	console.log();

	if (solutions.length === 0) {
		console.log('No solution found');
		return;
	}

	console.log(`Found ${solutions.length} solutions`);
	console.log();
	for (const solution of solutions) {
		console.log('Solution for path: ' + solution.path);
		displayCube(solution.cube);
	}
};
