import * as CubeTypes from '../../cube-utils/identifier-cube';
import { rotateFace } from '../../cube-utils/rotate-face';
import { MODE, STATE } from '../../data/state';
import * as HighlightTypes from '../../editing/cell-highlight';
import { colors, grayBackgrounds, highlight, highlight2 } from './terminal-output';

/**
 * @param {CubeTypes.Cube} cube
 * @param {HighlightTypes.CellHighlight[]} [highlightCells] Optional options
 * @param {boolean} [hideHints]
 */
export const displayCube = (cube, highlightCells, hideHints) => {

	const useColor = STATE.showColors;

	/**
	 * @param {CubeTypes.Face} face
	 * @return {CubeTypes.Face}
	 */
	const rotR = face => rotateFace(face);

	/**
	 * @param {CubeTypes.Face} face
	 * @return {CubeTypes.Face}
	 */
	const rotL = face => rotR(rotR(rotR(face)));

	/**
	 * @param {CubeTypes.Face} face
	 * @return {CubeTypes.Face}
	 */
	const rotB = face => rotR(rotR(face));

	const getLeft = () => getSection('Left', rotL(cube.U), cube.B, cube.L, cube.F, rotR(cube.D), useColor);
	const getFront = () => getSection('Front', cube.U, cube.L, cube.F, cube.R, cube.D, useColor);
	const getRight = () => getSection('Right', rotR(cube.U), cube.F, cube.R, cube.B, rotL(cube.D), useColor);
	const getBack = () => getSection('Back', rotB(cube.U), cube.R, cube.B, cube.L, rotB(cube.D), useColor);
	const getUp = () => getSection('Up', rotB(cube.B), rotR(cube.L), cube.U, rotL(cube.R), cube.F, useColor);
	const getDown = () => getSection('Down', cube.F, rotL(cube.L), cube.D, rotR(cube.R), rotB(cube.B), useColor);

	const join = (...liness) => {
		const res = liness[0].map(_ => '');
		liness.filter(x => x).forEach(lines => {
			for (let i = 0; i < lines.length; ++i) {
				if (res[i].length > 0)
					res[i] += '     ';
				res[i] += lines[i];
			}
		});
		return res;
	};

	const smallScreen = process.stdout.columns < 203;
	/* widths:
		getCube      - 18
		getLeft...   - 13 * 6
		getExtraCube - 19
		getExtraCube2- 23
		get3dCube    - 24
		spacer       -  5
	*/

	const lines = join(
		getCube(cube, useColor, highlightCells),
		smallScreen ? null : getLeft(),
		smallScreen ? null : getFront(),
		smallScreen ? null : getRight(),
		smallScreen ? null : getBack(),
		getUp(),
		smallScreen ? null : getDown(),
		getExtraCube(cube, useColor),
		getExtraCube2(cube, useColor),
		get3dCube(cube, useColor),
	);

	for (const line of lines)
		console.log(line);

	if (!hideHints) {
		console.log("  ↑x ↓x'  ←y →y'   rotate F: SHIFT+ ←z' →z");
		if (STATE.savedRecordings) {
			const recordingsLine = STATE.savedRecordings
				.map(rec => `  [${rec.key}]: ${rec.movements}`)
				.join('');
			console.log(recordingsLine);
		}
	}

	console.log();
};

/**
 * @param {Array<Array<string>>} arr
 * @return {string[]}
 */
const toLine = arr => arr.reduce((prev, curr) => [...prev, ...curr], []);

/**
 * @param {CubeTypes.Cube} cube
 * @param {boolean} useColor
 * @param {HighlightTypes.CellHighlight[] | undefined} highlightCells Optional options
 * @return {string[]}
 */
const getCube = (cube, useColor, highlightCells) => {
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

	const START = {
		U: [6, 3],
		L: [2, 7],
		F: [6, 7],
		R: [10, 7],
		B: [14, 7],
		D: [6, 11],
	};

	/** @type {CellHighlightHere[] | undefined} */
	let highlightCells2 = undefined;
	if (highlightCells) {
		// convert {face, x02, y02, higlight(1-2)} to {abs_x(0-), abs_y(0-), highlight(1-2)}
		// console.log('before', highlightCells);
		highlightCells2 = highlightCells.map(cell => ({
			highlight: cell.highlight,
			x: START[cell.face][0] + cell.x02,
			y: START[cell.face][1] + cell.y02,
		}));
		// console.log('after', highlightCells);
	}

	return colorize(lines, data, useColor, highlightCells2);
};

/**
 * @param {CubeTypes.Cube} cube
 * @param {boolean} useColor
 * @return {string[]}
 */
const getExtraCube = (cube, useColor) => {
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
	return colorize(lines, data, useColor);
};

/**
 * @param {CubeTypes.Cube} cube
 * @param {boolean} useColor
 * @return {string[]}
 */
const getExtraCube2 = (cube, useColor) => {
	const lines = [
		' Extra Cube:           ',
		'                       ',
		'                       ',
		'      X X X            ',
		'     XU U UX           ',
		'     XU U UX           ',
		' X X  U U U  X  X  X X ',
		'XL L LF F FR R R│B B BX',
		'XL L LF F FR R R│B B BX',
		'XL L LF F FR R R│B B BX',
		' X X  D D D  X  X  X X ',
		'     XD D DX           ',
		'     XD D DX           ',
		'      X X X            ',
		'                       ',
		'                       ',
		'                       ',
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

	// y0-, x0-, bkg_index(1-2)
	const backgrounds = [ [4, 6, 1], [7, 1, 1], [7, 6, 2], [7, 11, 1], [7, 17, 2], [10, 6, 1] ]
		// sort by Y axis ascending, X axis descending
		.sort((a, b) => a[0] === b[0] ? b[1] - a[1] : a[0] - b[0])
		.forEach(bkg => {
			const x = bkg[1];
			for (let y = bkg[0]; y < bkg[0] + 3; ++y) {
				lines[y] = lines[y].substring(0, x) + grayBackgrounds[bkg[2]] +
					lines[y].substring(x, x + 5) + grayBackgrounds[0] +
					lines[y].substring(x + 5);
			}
		});

	return colorize(lines, data, useColor);
};

/**
 * @param {CubeTypes.Cube} cube
 * @param {boolean} useColor
 * @return {string[]}
 */
const get3dCube = (cube, useColor) => {
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
	return colorizeWithDigits(lines, data, useColor);
};

/**
 * @param {string} title
 * @param {CubeTypes.Face} face1
 * @param {CubeTypes.Face} face2
 * @param {CubeTypes.Face} face3
 * @param {CubeTypes.Face} face4
 * @param {CubeTypes.Face} face5
 * @param {boolean} useColor
 * @return {string[]}
 */
const getSection = (title, face1, face2, face3, face4, face5, useColor) => {
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
	return colorize(lines, data, useColor);
};

/**
 * @param {string[]} lines
 * @param {Object.<string, string[]>} data
 * @param {boolean} useColor
 * @param {CellHighlightHere[] | undefined} [highlightCells]
 * @return {string[]}
 */
const colorize = (lines, data, useColor, highlightCells) => lines.map((line, rowIndex) => {
	let s = '';
	let column = 0;
	for (const ch of line) {
		if (ch in data) {
			const col = data[ch].splice(0, 1)[0];
			const color = (useColor && colors[col]) || 'Q';
			const highlightCell = highlightCells ? highlightCells.find(cell => cell.x === column && cell.y === rowIndex) : null;
			const h = highlightCell
				? highlightCell.highlight === 1 ? highlight : highlight2
				: 'Q';
			s += color.replace('Q', h).replace('Q', getCell(col));
		} else
			s += ch;
		++column;
	}
	return s;
});

/**
 * @param {string[]} lines
 * @param {Object.<string, string[]>} data
 * @param {boolean} useColor
 * @return {string[]}
 */
const colorizeWithDigits = (lines, data, useColor) => lines.map(line => {
	for (const ch in data) {
		for (let digit = 1; digit <= 9; ++digit) {
			const col = data[ch][digit - 1];
			const color = (useColor && colors[col]) || 'Q';
			line = line.replace(new RegExp(ch + digit, 'g'), color.replace('Q', getCell(col)));
		}
	}
	return line;
});

/**
 * @param {string} label
 * @return {string}
 */
const getCell = label => {
	if (STATE.cellLabels || label === ' ')
		return label;
	return STATE.mode === MODE.BROWSE ? '█' : '▌';
};

/**
 * @typedef CellHighlightHere
 * @property {number} highlight - 1 or 2
 * @property {number} x
 * @property {number} y
 */
