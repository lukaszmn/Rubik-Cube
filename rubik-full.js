const fs = require('fs');

const sampleCube = [
	'Y',                  // 0
	' Y G Y O Y Y Y Y',   // 1
	'OOY RBB YRB RGG',    // 2
	'BBB RRR GGG OOO',    // 3
	'BBB RRR GGG OOO',    // 4
	' W W W W W W W W',   // 5
	'W'                   // 6
];

const targetCube = [
	'Y',                  // 0
	' Y Y Y Y Y Y Y Y',   // 1
	'BBB RRR GGG OOO',    // 2
	'BBB RRR GGG OOO',    // 3
	'BBB RRR GGG OOO',    // 4
	' W W W W W W W W',   // 5
	'W'                   // 6
];

const markedCube = [
	'Y',                  // 0
	' Y Y Y Y . Y Y Y',   // 1
	'BBB RRR GGG OOO',    // 2
	'BB. RR. GG. OO.',    // 3
	'BBB RRR GGG OOO',    // 4
	' W W W W . W W W',   // 5
	'W'                   // 6
];

const createSide = () => [ ['-', '-', '-'], ['-', '-', '-'], ['-', '-', '-'] ];

const readCube = arr => {
	const cube = {
		U: createSide(),
		L: createSide(),
		F: createSide(),
		R: createSide(),
		B: createSide(),
		D: createSide(),
	};

	const top = arr[1].trim().split(' ');
	cube.U = [
		[ top[7], top[6], top[5] ],
		[ top[0], arr[0], top[4] ],
		[ top[1], top[2], top[3] ],
	];

	const bot = arr[5].trim().split(' ');
	cube.D = [
		[ bot[1], bot[2], bot[3] ],
		[ bot[0], arr[6], bot[4] ],
		[ bot[7], bot[6], bot[5] ],
	];

	const readSide = index => {
		const face = [
			arr[2].split(' ')[index],
			arr[3].split(' ')[index],
			arr[4].split(' ')[index],
		];
		return face.map(s => Array.from(s));
	}

	cube.L = readSide(0);
	cube.F = readSide(1);
	cube.R = readSide(2);
	cube.B = readSide(3);

	return cube;
};

// https://github.com/dariuszp/colog/blob/master/src/colog.js
const colors = {
	Y: '\033[93mQ\033[37m',
	B: '\033[94mQ\033[37m',
	R: '\033[91mQ\033[37m',
	G: '\033[92mQ\033[37m',
	O: '\033[38;5;214mQ\033[37m',
	W: '\033[97mQ\033[37m',
};
const highlight = '\033[46mQ\033[49m';

const clearScreen = () => {
	// https://en.wikipedia.org/wiki/ANSI_escape_code#CSI_(Control_Sequence_Introducer)_sequences
	const clearScreen_ = '\033[2J';
	console.log(clearScreen_);
	needsClearScreen = false;
};

const logAndClearLine = s => {
	const width = process.stdout.columns - 1;
	const spaces = ' '.repeat(width);
	s = (s + spaces).slice(0, width);
	console.log(s);
};

const clear = msg => {
	if (needsClearScreen)
		clearScreen();

	// https://en.wikipedia.org/wiki/ANSI_escape_code#CSI_(Control_Sequence_Introducer)_sequences
	const move100LinesUp = '\033[91' + '10' + 'A';
	console.log(move100LinesUp);
	msg = msg ?? 'F1 - help';
	logAndClearLine(msg);
};

let needsClearScreen = true;

const displayCube = (cube, cursorX, cursorY) => {

	const toLine = arr => arr.reduce((prev, curr) => [...prev, ...curr], []);

	const getCube = () => {
		const lines = [
			' Cube:            ',
			'                  ',
			'     ┌───┐        ',
			'     │UUU│        ',
			'     │UUU│        ',
			'     │UUU│        ',
			' ┌───┼───┼───┬───┐',
			' │LLL│FFF│RRR│BBB│',
			' │LLL│FFF│RRR│BBB│',
			' │LLL│FFF│RRR│BBB│',
			' └───┼───┼───┴───┘',
			'     │DDD│        ',
			'     │DDD│        ',
			'     │DDD│        ',
			'     └───┘        ',
			'                  ',
			'                  ',
		];
		const data = {
			U: toLine(cube.U),
			D: toLine(cube.D),
			L: toLine(cube.L),
			R: toLine(cube.R),
			F: toLine(cube.F),
			B: toLine(cube.B),
		};

		const cx = cursorX + Math.floor((cursorX - 1) / 3);
		const cy = cursorY + Math.floor((cursorY - 1) / 3);

		return colorize(lines, data, cx + 1, cy + 2);
	};

	const getExtraCube = () => {
		const lines = [
			' Extra Cube:       ',
			'      XXX          ',
			'     ┌───┐         ',
			'    X│UUU│X        ',
			'    X│UUU│X        ',
			'  XX │UUU│ X X XX  ',
			' ┌───┼───┼───┬───┐ ',
			'X│LLL│FFF│RRR│BBB│X',
			'X│LLL│FFF│RRR│BBB│X',
			'X│LLL│FFF│RRR│BBB│X',
			' └───┼───┼───┴───┘ ',
			'  XX │DDD│ X X XX  ',
			'    X│DDD│X        ',
			'    X│DDD│X        ',
			'     └───┘         ',
			'      XXX          ',
			'                   ',
		];
		const data = {
			U: toLine(cube.U),
			D: toLine(cube.D),
			L: toLine(cube.L),
			R: toLine(cube.R),
			F: toLine(cube.F),
			B: toLine(cube.B),
			X: [
				cube.B[0][2], cube.B[0][1], cube.B[0][0],
				cube.L[0][0], cube.R[0][2],
				cube.L[0][1], cube.R[0][1],
				cube.U[0][0], cube.U[1][0], cube.U[1][2], cube.U[0][2], cube.U[0][1], cube.U[0][0],
				cube.B[0][2], cube.L[0][0],
				cube.B[1][2], cube.L[1][0],
				cube.B[2][2], cube.L[2][0],
				cube.D[2][0], cube.D[1][0], cube.D[1][2], cube.D[2][2], cube.D[2][1], cube.D[2][0],
				cube.L[2][1], cube.R[2][1],
				cube.L[2][0], cube.R[2][2],
				cube.B[2][2], cube.B[2][1], cube.B[2][0]
			],
		};
		return colorize(lines, data);
	};

	const get3dCube = () => {
		/*
		*       +----+----+----+
		*      / U  / U  / U  /|
		*     +----+----+----+ |
		*    / U  / U  / U  /|R+
		*   +----+----+----+ |/|
		*  / U  / U  / U  /|R+ |
		* +----+----+----+ |/|R+
		* |    |    |    |R+ |/|
		* | F  | F  | F  |/|R+ |
		* +----+----+----+ |/|R+
		* |    |    |    |R+ |/
		* | F  | F  | F  |/|R+
		* +----+----+----+ |/
		* |    |    |    |R+
		* | F  | F  | F  |/
		* +----+----+----+
		*/
		const lines = [
			' .       +-.-.-.-.+-.-.-.-.+-.-.-.-....+',
			' .      /U1U1U1U1/U2U2U2U2/U3U3U3U3/...|',
			' .     +-.-.-.-.+-.-.-.-.+-.-.-.-...+. |',
			' .    /U4U4U4U4/U5U5U5U5/U6U6U6U6../|R3+',
			' .   +-.-.-.-.+-.-.-.-.+-.-.-.-..+ |./.|',
			' .  /U7U7U7U7/U8U8U8U8/U9U9U9U9./|R2+ .|',
			' . +-.-.-.-.+-.-.-.-.+-.-.-.-.+ |./|R6+',
			'L3 |F1F1F1F1|F2F2F2F2|F3F3F3F3|R1+ .|./|',
			'L3 |F1F1F1F1|F2F2F2F2|F3F3F3F3|./|R5+ .|',
			'  +-.-.-.-.+-.-.-.-.+-.-.-.-.| .|./|R9+',
			'L6 |F4F4F4F4|F5F5F5F5|F6F6F6F6|R4+ .|./',
			'L6 |F4F4F4F4|F5F5F5F5|F6F6F6F6|./|R8+',
			' . +-.-.-.-.+-.-.-.-.+-.-.-.-.+ .|./',
			'L9 |F7F7F7F7|F8F8F8F8|F9F9F9F9|R7+',
			'L9 |F7F7F7F7|F8F8F8F8|F9F9F9F9|./',
			' . +-.-.-.-.+-.-.-.-.+-.-.-.-.+',
			' .  D1D1D1D1 D2D2D2D2 D3D3D3D3 ',
		].map(s => s.replace(/\./g, ''));
		const data = {
			U: toLine(cube.U),
			R: toLine(cube.R),
			F: toLine(cube.F),
			L: toLine(cube.L),
			B: toLine(cube.B),
			D: toLine(cube.D),
		};
		return colorizeWithDigits(lines, data);
	};

	const getSection = (title, face1, face2, face3, face4, face5) => {
		const lines = [
			(title + ':').padEnd(13, ' '),
			'             ',
			'    ┌───┐    ',
			'    │111│    ',
			'    │111│    ',
			'    │111│    ',
			'┌───┼───┼───┐',
			'│222│333│444│',
			'│222│333│444│',
			'│222│333│444│',
			'└───┼───┼───┘',
			'    │555│    ',
			'    │555│    ',
			'    │555│    ',
			'    └───┘    ',
			'             ',
			'             ',
		];
		const data = {
			1: toLine(face1),
			2: toLine(face2),
			3: toLine(face3),
			4: toLine(face4),
			5: toLine(face5),
		};
		return colorize(lines, data);
	};
	const rotR = face => rotateFace(face);
	const rotL = face => rotR(rotR(rotR(face)));
	const rotB = face => rotR(rotR(face));
	const getLeft = () => getSection('Left', rotL(cube.U), cube.B, cube.L, cube.F, rotR(cube.D));
	const getFront = () => getSection('Front', cube.U, cube.L, cube.F, cube.R, cube.D);
	const getRight = () => getSection('Right', rotR(cube.U), cube.F, cube.R, cube.B, rotL(cube.D));
	const getBack = () => getSection('Back', rotB(cube.U), cube.R, cube.B, cube.L, rotB(cube.D));
	const getUp = () => getSection('Up', rotB(cube.B), rotR(cube.L), cube.U, rotL(cube.R), cube.F);
	const getDown = () => getSection('Down', cube.F, rotL(cube.L), cube.D, rotR(cube.R), rotB(cube.B));

	const colorize = (lines, data, cursorX, cursorY) => lines.map((line, rowIndex) => {
		let s = '';
		let column = 0;
		for (const ch of line) {
			if (ch in data) {
				const col = data[ch].splice(0, 1)[0];
				const color = colors[col] || 'Q';
				const h = cursorX === column && cursorY === rowIndex ? highlight : 'Q';
				s += color.replace('Q', h).replace('Q', col);
			} else
				s += ch;
			++column;
		}
		return s;
	});

	const colorizeWithDigits = (lines, data) => lines.map(line => {
		for (const ch in data) {
			for (let digit = 1; digit <= 9; ++digit) {
				const col = data[ch][digit - 1];
				const color = colors[col] || 'Q';
				line = line.replace(new RegExp(ch + digit, 'g'), color.replace('Q', col));
			}
		}
		return line;
	});

	const join = (...liness) => {
		const res = liness[0].map(_ => '');
		liness.forEach(lines => {
			for (let i = 0; i < lines.length; ++i) {
				if (res[i].length > 0)
					res[i] += '     ';
				res[i] += lines[i];
			}
		});
		return res;
	};

	let lines = join(getCube(), getLeft(), getFront(), getRight(), getBack(), getUp(), getDown(), getExtraCube(), get3dCube());

	for (const line of lines)
		console.log(line);

	console.log("  ↑x ↓x'  ←y →y'   rotate F: SHIFT+ ←z' →z");
	console.log();
};

const readTransform = (source, transform) => transform.map(s => s.split(' ')).map(arr => arr.map(x => source[x[0]][x[1]]));

const rotateFace = face => readTransform(face, [
	'20 10 00',
	'21 11 01',
	'22 12 02',
]);

const transformCube = (faceToRotate, edge1, edge2, edge3, edge4) => {

	const copyArray = (src, dest) => {
		for (let i = 0; i < src.length; ++i)
			dest[i] = src[i];
	};
	const copyEdge = (src, dest) => {
		for (let i = 0; i < src.edge.length; ++i) {
			const destRow = dest.edge[i][0];
			const destCol = dest.edge[i][1];
			const srcRow = src.edge[i][0];
			const srcCol = src.edge[i][1];
			dest.face[destRow][destCol] = src.face[srcRow][srcCol];
		}
	};
	const copy2DArray = (src, dest) => {
		for (let rowIndex = 0; rowIndex < dest.length; ++rowIndex) {
			const row = dest[rowIndex];
			for (let colIndex = 0; colIndex < row.length; ++colIndex) {
				dest[rowIndex][colIndex] = src[rowIndex][colIndex];
			}
		}
	};

	if (faceToRotate) {
		const rotatedFace = rotateFace(faceToRotate);
		copy2DArray(rotatedFace, faceToRotate);
	}

	const tmp = {
		face: createSide(),
		edge: edge1.edge
	};
	copy2DArray(edge1.face, tmp.face);
	copyEdge(edge1, tmp);
	copyEdge(edge4, edge1);
	copyEdge(edge3, edge4);
	copyEdge(edge2, edge3);
	copyEdge(tmp, edge2);
};

const columnDown = (face, index) => ({
	face,
	edge: [ '00 10 20', '01 11 21', '02 12 22'][index].split(' '),
});
const columnUp = (face, index) => ({
	face,
	edge: [ '20 10 00', '21 11 01', '22 12 02'][index].split(' '),
});
const rowLeft = (face, index) => ({
	face,
	edge: [ '00 01 02', '10 11 12', '20 21 22'][index].split(' '),
});
const rowRight = (face, index) => ({
	edge: [ '02 01 00', '12 11 10', '22 21 20'][index].split(' '),
	face,
});

const _movements = {
	U: cube => transformCube(cube.U, rowLeft(cube.L, 0), rowLeft(cube.B, 0), rowLeft(cube.R, 0), rowLeft(cube.F, 0)),
	D: cube => transformCube(cube.D, rowRight(cube.L, 2), rowRight(cube.F, 2), rowRight(cube.R, 2), rowRight(cube.B, 2)),
	L: cube => transformCube(cube.L, columnDown(cube.U, 0), columnDown(cube.F, 0), columnDown(cube.D, 0), columnUp(cube.B, 2)),
	R: cube => transformCube(cube.R, columnDown(cube.B, 0), columnUp(cube.D, 2), columnUp(cube.F, 2), columnUp(cube.U, 2)),
	F: cube => transformCube(cube.F, columnDown(cube.R, 0), rowLeft(cube.D, 0), columnUp(cube.L, 2), rowRight(cube.U, 2)),
	B: cube => transformCube(cube.B, columnDown(cube.L, 0), rowRight(cube.D, 2), columnUp(cube.R, 2), rowLeft(cube.U, 0)),

	M: cube => transformCube(null, columnDown(cube.U, 1), columnDown(cube.F, 1), columnDown(cube.D, 1), columnUp(cube.B, 1)),
	E: cube => transformCube(null, rowRight(cube.L, 1), rowRight(cube.F, 1), rowRight(cube.R, 1), rowRight(cube.B, 1)),
	S: cube => transformCube(null, columnDown(cube.R, 1), rowLeft(cube.D, 1), columnUp(cube.L, 1), rowRight(cube.U, 1)),
};
const prime = x => { x(); x(); x(); };
const movements = {
	..._movements,
	// U_: cube => prime(() => _movements.U(cube)),
	// D_: cube => prime(() => _movements.D(cube)),
	// L_: cube => prime(() => _movements.L(cube)),
	// R_: cube => prime(() => _movements.R(cube)),
	// F_: cube => prime(() => _movements.F(cube)),
	// B_: cube => prime(() => _movements.B(cube)),

	// M_: cube => prime(() => _movements.M(cube)),
	// E_: cube => prime(() => _movements.E(cube)),
	// S_: cube => prime(() => _movements.S(cube)),

	u: cube => { _movements.U(cube); movements.E_(cube) },
	d: cube => { _movements.D(cube); movements.E(cube) },
	l: cube => { _movements.L(cube); movements.M(cube) },
	r: cube => { _movements.R(cube); movements.M_(cube) },
	f: cube => { _movements.F(cube); movements.S(cube) },
	b: cube => { _movements.B(cube); movements.S_(cube) },

	// u_: cube => prime(() => movements.u(cube)),
	// d_: cube => prime(() => movements.d(cube)),
	// r_: cube => prime(() => movements.r(cube)),
	// l_: cube => prime(() => movements.l(cube)),
	// f_: cube => prime(() => movements.f(cube)),
	// b_: cube => prime(() => movements.b(cube)),

	x: cube => { movements.r(cube); movements.L_(cube); },
	y: cube => { movements.u(cube); movements.D_(cube); },
	z: cube => { movements.f(cube); movements.B_(cube); },
	// X_: cube => { _movements.X(cube); _movements.X(cube); _movements.X(cube); },
};
for (const key in movements)
	movements[key + '_'] = cube => prime(() => movements[key](cube));

const cloneCube = cube => ({
	U: cube.U.map(row => row.map(cell => cell)),
	L: cube.L.map(row => row.map(cell => cell)),
	F: cube.F.map(row => row.map(cell => cell)),
	R: cube.R.map(row => row.map(cell => cell)),
	B: cube.B.map(row => row.map(cell => cell)),
	D: cube.D.map(row => row.map(cell => cell)),
});

const scramble = (cube, count) => {
	let path = '';
	for (let i = 0; i < count; ++i) {
		const movIndex = Math.floor(Math.random() * Object.keys(movements).length);
		const mov = Object.keys(movements)[movIndex];
		path += mov.replace('_', "'");
		movements[mov](cube);
	}
	return { path, cube };
};

const validate = cube => {
	const counts = {
		W: 0,
		R: 0,
		G: 0,
		B: 0,
		O: 0,
		Y: 0,
		'-': 0
	};

	for (const face in cube) {
		for (const row of cube[face]) {
			for (const cell of row)
				++counts[cell];
		}
	}

	for (const key in counts) {
		if (key !== '-' && counts[key] > 9)
			return { valid: false, counts };
	}
	return { valid: true, counts };
};


// let cube = readCube(sampleCube);
let cube = readCube(targetCube);
// let cube = readCube(markedCube);

clear();
displayCube(cube);

// for (const movement in movements) {
// 	let cube1 = cloneCube(cube);
// 	console.log(movement);
// 	movements[movement](cube1);
// 	displayCube(cube1);
// }

// let cube2 = cloneCube(cube);
// movements.z(cube2);
// displayCube(cube2);

const act = (cube, showSteps, steps) => {
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

// act(cube, true, "RUR'URUUR'");

const readline = require('readline');

readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY)
	process.stdin.setRawMode(true);

let c = cloneCube(cube);
const history = [cloneCube(c)];
let wasPrime = false;
let editMode = false;
let typingMode = false;

process.stdin.on('keypress', (str, key) => {
	if (typingMode)
		return;
	// esc, CTRL+C
	if (key.name === 'escape' || key.sequence === '\x03')
		process.exit();

	let keyName = key.name || str;
	if (key.shift && keyName.length === 1)
		keyName = keyName.toUpperCase();

  // console.log(keyName, str, key);

	if (!editMode)
		processKey(keyName, key.shift);
	else
		processKeyInEdit(keyName, key.shift, key.ctrl);
});

const processKey = (keyName, shift) => {
	let movKey = keyName + (wasPrime ? '_' : '');

	switch (keyName) {
		case "'": wasPrime = true; return;
		case 'left': movKey = shift ? 'z_' : 'y'; break;
		case 'right': movKey = shift ? 'z' : 'y_'; break;
		case 'up': movKey = 'x'; break;
		case 'down': movKey = 'x_'; break;

		case 'backspace':
			if (history.length > 1) {
				history.pop();
				c = cloneCube(history[history.length - 1]);
				clear('Undo');
				displayCube(c);
			}
			break;

		case 'f1':
			console.log('F1 - help');
			console.log('F2 - edit mode');
			console.log('F4 - perform moves'); // TODO
			console.log('backspace - undo last move');
			console.log('arrow keys - rotate');
			console.log('= - reset');
			console.log('` - scramble');
			console.log('escape or CTRL+C - exit');
			console.log('Movements: UDLRFB udlrfb MES xyz');
			console.log("Press 'U to create movement U'");
			needsClearScreen = true;
			break;

		case 'f2':
			editMode = true;
			needsClearScreen = true;
			processKeyInEdit(undefined, false, false);
			break;

		case 'f4':
			if (process.stdin.isTTY)
				process.stdin.setRawMode(false);
			typingMode = true;

			const rl = readline.createInterface({
				input: process.stdin,
				output: process.stdout,
				terminal: false,
			});

			rl.question('Type movements (UDLRFB udlrfb MES xyz): ', answer => {
				act(c, false, answer);
				history.push(cloneCube(c));
				// TODO: 1. either of close() or pause() stops the application
				// rl.close();
				// rl.pause();
				// TODO: 2. moving readline.createInterface() out of this method causes that user's answer contains "\x1B[[D"

				if (process.stdin.isTTY)
					process.stdin.setRawMode(true);
				typingMode = false;
				needsClearScreen = true;
			});

			break;

		case '=':
			c = readCube(targetCube);
			clear('Reset');
			history.push(cloneCube(c));
			displayCube(c);
			break;

		case '`':
			// const cube = readCube(targetCube);
			const scrambleRes = scramble(c, 1);
			c = scrambleRes.cube;
			clear('Scramble: ' + scrambleRes.path);
			history.push(cloneCube(c));
			displayCube(c);
			break;
	}

	const mov = movements[movKey];
	if (mov) {
		clear('Movement: ' + movKey.replace('_', "'"));
		mov(c);
		displayCube(c);
		history.push(cloneCube(c));
	}
	wasPrime = false;
};

let cursorX = 4, cursorY = 4;
const processKeyInEdit = (keyName, shift, ctrl) => {
	let movKey = undefined;
	let needsLaterClearScreen = false;

	switch (keyName) {
		case 'left':
			if (shift)
				movKey = 'y';
			else if (cursorX > 1 && cursorY >= 4 && cursorY <= 6)
				--cursorX;
			else if (cursorX > 4 && (cursorY < 4 || cursorY > 6))
				--cursorX;
			break;
		case 'right':
			if (shift)
				movKey = 'y_';
			else if (cursorX < 12 && cursorY >= 4 && cursorY <= 6)
				++cursorX;
			else if (cursorX < 6 && (cursorY < 4 || cursorY > 6))
				++cursorX;
			break;
		case 'up':
			if (shift)
				movKey = 'x';
			else if (cursorY > 1 && cursorX >= 4 && cursorX <= 6)
				--cursorY;
			else if (cursorY > 4 && (cursorX < 4 || cursorX > 6))
				--cursorY;
			break;
		case 'down':
			if (shift)
				movKey = 'x_';
			else if (cursorY < 9 && cursorX >= 4 && cursorX <= 6)
				++cursorY;
			else if (cursorY < 6 && (cursorX < 4 || cursorX > 6))
				++cursorY;
			break;

		case 'W':
		case 'w':
		case 'R':
		case 'r':
		case 'Y':
		case 'y':
		case 'B':
		case 'b':
		case 'G':
		case 'g':
		case 'O':
		case 'o':
		case '_':
		case '-':
			const keys = {
				'W': { color: 'W', face: true },
				'w': { color: 'W', face: false },
				'R': { color: 'R', face: true },
				'r': { color: 'R', face: false },
				'Y': { color: 'Y', face: true },
				'y': { color: 'Y', face: false },
				'B': { color: 'B', face: true },
				'b': { color: 'B', face: false },
				'G': { color: 'G', face: true },
				'g': { color: 'G', face: false },
				'O': { color: 'O', face: true },
				'o': { color: 'O', face: false },
				'_': { color: '-', face: true },
				'-': { color: '-', face: false },
			}
			let face, cx, cy;
			if (cursorX <= 3) { face = c.L; cx = cursorX; cy = cursorY - 3; }
			else if (cursorX <= 6 && cursorY <= 3) { face = c.U; cx = cursorX - 3; cy = cursorY; }
			else if (cursorX <= 6 && cursorY <= 6) { face = c.F; cx = cursorX - 3; cy = cursorY - 3; }
			else if (cursorX <= 6 && cursorY <= 9) { face = c.D; cx = cursorX - 3; cy = cursorY - 6; }
			else if (cursorX <= 9) { face = c.R; cx = cursorX - 6; cy = cursorY - 3; }
			else if (cursorX <= 12) { face = c.B; cx = cursorX - 9; cy = cursorY - 3; }

			const color = keys[keyName].color;
			const entireFace = keys[keyName].face;

			if (face) {
				face[cy - 1][cx - 1] = color;
				if (entireFace) {
					// upper case - color entire face
					for (cx = 0; cx < 3; ++cx) {
						for (cy = 0; cy < 3; ++cy)
							face[cy][cx] = color;
					}
				}
			}
			break;

		case 'f2':
			editMode = false;
			needsClearScreen = true;
			clear();
			displayCube(c);
			history.push(cloneCube(c));
			return;

		case '=':
			c = readCube(targetCube);
			clear('Reset');
			history.push(cloneCube(c));
			displayCube(c);
			break;

		case 's':
			if (ctrl) {
				fs.writeFileSync('cube.json', JSON.stringify(c, null, 2));
				console.log('Saved');
				needsClearScreen = true;
				return;
			}
			break;

		case 'l':
			if (ctrl) {
				const fileContents = fs.readFileSync('cube.json', 'utf-8');
				c = JSON.parse(fileContents);
				console.log('Loaded');
				needsLaterClearScreen = true;
			}
			break;
	}

	clear('E D I T   M O D E');
	console.log('F2 - exit edit | arrow keys - move cursor | arrows + shift - move cube | = - reset cube | R/G/B/O/W/Y/- - place color, with shift - color entire face | CTRL + L/S - load/save state');
	console.log();

	const res = validate(c);
	let s = '  Counts: ';
	s += Array.from('RGBOWY-')
		.map(col => {
			const formatColor = colors[col] || 'Q'
			const formattedColorName = formatColor.replace('Q', col);

			const optionalHighlight = res.counts[col] === 9 ? 'Q' : highlight;
			const formattedCount = optionalHighlight.replace('Q', res.counts[col]);

			return formattedColorName + ' ' + formattedCount;
		}).join(',  ');
	s += res.valid ? '' : ' - INVALID';
	logAndClearLine(s);

	const mov = movements[movKey];
	if (mov) {
		console.log('Movement: ' + movKey.replace('_', "'"));
		mov(c);
	} else {
		console.log();
	}

	displayCube(c, cursorX, cursorY);

	if (needsLaterClearScreen)
		needsClearScreen = true;
};
