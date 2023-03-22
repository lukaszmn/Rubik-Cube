import { toCube } from './src/cube-utils/cube-converters';
import { solve, timers } from './src/feats/solver';
import { colors } from './src/UI/terminal/terminal-output';

const act = maxSteps => {
	/* eslint quotes: "off" */
	const options = [
		// { name: 'up', movements: "x" },
		// { name: 'down', movements: "x'" },
		{ name: 'left', movements: "y" },
		{ name: 'right', movements: "y'" },
		{ name: '2right', movements: "yy" },
		// { name: 'FRU', movements: "FRU R'U'F'" },
		// { name: 'FRU2', movements: "FUR U'R'F'" },
		// { name: 'RUR', movements: "RUR'U RUUR'" },
		// { name: 'rogi', movements: "RB' RFFR' BR FFRR" },
		// { name: 'koniec-lewo', movements: "FFU LR' FF L'R UFF" },
		// { name: 'koniec-prawo', movements: "FFU' LR' FF L'R U'FF" },
		// { name: 'RH', movements: "RUR'U'" },
		// { name: 'LH', movements: "L'U'LU" },
		{ name: 'R', movements: "R" },
		{ name: "R'", movements: "R'" },
		{ name: 'U', movements: "U" },
		{ name: "U'", movements: "U'" },
		{ name: 'L', movements: "L" },
		{ name: "L'", movements: "L'" },
		{ name: 'F', movements: "F" },
		{ name: "F'", movements: "F'" },
	];

	const STATE = {
		optimize: {
			maxSteps,
			source: toCube("YYYYYYYYY BOBBBBBBB RGRRRRRRR GRGGGGGGG OBOOOOOOO WWWWWWWWW"),
			target: toCube("YYYYYYYYY BBBBBBBBB RRRRRRRRR GGGGGGGGG OOOOOOOOO WWWWWWWWW"),
			options,
		}
	};

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
		// displayCube(solution.cube);
	}
};


act(7);
for (const key in timers) {
	const duration = Number(timers[key] / 1000000n);
	const keyWithColor = colors.G.replace('Q', key);
	const durationWithColor = colors.O.replace('Q', '' + Math.round(duration));
	console.log(`${keyWithColor} -> ${durationWithColor}`);
}
