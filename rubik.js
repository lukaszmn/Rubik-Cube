const initialCube = [
	'-BRY-',
	'RYYOB',
	'GYYYB',
	'GYYGR',
	'-OOY-'
];

const transform = [
	'00 34 24 41 00',
	'33 43 23 31 30',
	'02 12 22 21 20',
	'03 14 32 01 11',
	'00 13 42 10 00',
];

/////////////////////

const identity = [
	'00 01 02 03 04',
	'10 11 12 13 14',
	'20 21 22 23 24',
	'30 31 32 33 34',
	'40 41 42 43 44',
];

const rotate = [
	'40 30 20 10 00',
	'41 31 21 11 01',
	'42 32 22 12 02',
	'43 33 23 13 03',
	'44 34 24 14 04',
];

const transformSource = (cube, transform) => transform.map(s => s.split(' ')).map(arr => arr.map(x => cube[x[0]][x[1]]));
const runSource = cube => transformSource(cube, transform);
const rotateRightSource = cube => transformSource(cube, rotate);

const validate = cube => {
	const counts = {
		W: 9,
		R: 6,
		G: 6,
		B: 6,
		O: 6,
		Y: 0,
		'-': 0
	};

	for (const row of cube) {
		for (const cell of row)
			++counts[cell];
	}

	for (const key in counts) {
		if (key !== '-' && counts[key] !== 9)
			throw new Error('Invalid counts: ' + JSON.stringify(counts, null, 2));
	}
};

const toOneLine = cube => cube.map(s => s.join('')).join('');

const isTarget = (cube, color) => {
	const section = cube.slice(1, -1).map(s => s.slice(1, -1));
	const inOneLine = toOneLine(section);
	const onlyColor = inOneLine.replaceAll(color, '');
	return onlyColor.length === 0;
	// console.log(onlyColor);
	// display(section);
};

const display = cube => {
	console.log('Cube:');
	for (const s of cube) {
		if (typeof s === 'string')
			console.log(' ' + s);
		else
			console.log(' ' + s.join(''));
	}
};

const displayCube = cube => {
	console.log('Cube:');
	for (let rowIndex = 0; rowIndex < cube.length; ++rowIndex) {
		if (rowIndex === 1)
			console.log(' ┌───┐ ');
		if (rowIndex === cube.length - 1)
			console.log(' └───┘ ');
		const row = cube[rowIndex];
		const ch = (rowIndex === 0 || rowIndex === cube.length - 1) ? ' ' : '│';
		console.log(row[0] + ch + row[1] + row[2] + row[3] + ch + row[4]);
	}
	console.log();
};
const displayCube2 = cube => {
	console.log('Cube:');
	for (let rowIndex = 0; rowIndex < cube.length; ++rowIndex) {
		if (rowIndex === 1 || rowIndex === cube.length - 1)
			console.log('─┼───┼─');
		const row = cube[rowIndex];
		const cr = row.map(x => {
			switch (x) {
				case 'Y': return '\033[33m' + x + '\033[37m';
				case 'B': return '\033[34m' + x + '\033[37m';
				case 'R': return '\033[31m' + x + '\033[37m';
				case 'G': return '\033[32m' + x + '\033[37m';
				case 'O': return '\033[35m' + x + '\033[37m';
				default: return x;
			}
		});
		console.log(cr[0] + '│' + cr[1] + cr[2] + cr[3] + '│' + cr[4]);
	}
	console.log();
};


let cube = initialCube;

displayCube(cube);
validate(cube);

const options = [
	{ name: 'run', fn: cube => runSource(cube) },
	{ name: 'right', fn: cube => rotateRightSource(cube) },
	{ name: 'left', fn: cube => rotateRightSource(rotateRightSource(rotateRightSource(cube))) },
	{ name: '180deg', fn: cube => rotateRightSource(rotateRightSource(cube)) },
];

/*
console.log('Transformed:');
const res = rotateRightSource(rotateRightSource(rotateRightSource(cube)));
validate(res);
display(res);
const found = isTarget(res, 'Y');
if (found)
	console.log('Is target');
*/

/*
let steps = [{
	path: '',
	cube: transformSource(initialCube, identity),
	previousCubes: [],
}];

const solutions = [];

let maxSteps = 10;
while (maxSteps-- >= 0 && solutions.length === 0) {
	const newSteps = [];
	for (const step of steps) {
		for (const option of options) {

			const newStep = {
				path: step.path + ' ' + option.name,
				cube: option.fn(step.cube),
				previousCubes: [...step.previousCubes, toOneLine(step.cube)],
			};
			if (newStep.previousCubes.includes(toOneLine(newStep.cube)))
				continue;
			newSteps.push(newStep);
			if (isTarget(newStep.cube))
				solutions.push(newStep);
		}
	}

	steps = newSteps;
}

if (solutions.length > 0) {
	console.log(`Found ${solutions.length} solutions`);
	for (const solution of solutions) {
		console.log('Solution for path: ' + solution.path);
		display(solution.cube);
	}
} else {
	console.log('No solution found');
	console.log(steps.slice(10000, 10010).map(s => s.path));
	console.log(steps.slice(-10, -1).map(s => s.path));
}
*/

const action = (cube, name) => {
	const newCube = options.find(x => x.name === name).fn(cube);
	console.log(`Action: ${name}`);
	displayCube2(newCube);
	return newCube;
}
let c = action(cube, '180deg');
c = action(cube, 'run');
