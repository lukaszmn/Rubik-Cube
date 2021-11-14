import { rotateFace } from './rotate-face';
import { colors, highlight } from './terminal-output';

export const displayCube = (cube, previousCube, cursorX, cursorY) => {

	const rotR = face => rotateFace(face);
	const rotL = face => rotR(rotR(rotR(face)));
	const rotB = face => rotR(rotR(face));
	const getLeft = () => getSection('Left', rotL(cube.U), cube.B, cube.L, cube.F, rotR(cube.D));
	const getFront = () => getSection('Front', cube.U, cube.L, cube.F, cube.R, cube.D);
	const getRight = () => getSection('Right', rotR(cube.U), cube.F, cube.R, cube.B, rotL(cube.D));
	const getBack = () => getSection('Back', rotB(cube.U), cube.R, cube.B, cube.L, rotB(cube.D));
	const getUp = () => getSection('Up', rotB(cube.B), rotR(cube.L), cube.U, rotL(cube.R), cube.F);
	const getDown = () => getSection('Down', cube.F, rotL(cube.L), cube.D, rotR(cube.R), rotB(cube.B));

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

	const lines = join(
		getCube(cube, cursorX, cursorY),
		getLeft(),
		getFront(),
		getRight(),
		getBack(),
		getUp(),
		getDown(),
		getExtraCube(cube),
		get3dCube(cube),
	);
	// const lines = join(getCube(), getExtraCube(), get3dCube());

	for (const line of lines)
		console.log(line);

	console.log("  ↑x ↓x'  ←y →y'   rotate F: SHIFT+ ←z' →z");
	console.log();
};

const toLine = arr => arr.reduce((prev, curr) => [...prev, ...curr], []);

const getCube = (cube, cursorX, cursorY) => {
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

const getExtraCube = cube => {
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
			cube.B[2][2], cube.B[2][1], cube.B[2][0],
		],
	};
	return colorize(lines, data);
};

const get3dCube = cube => {
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
