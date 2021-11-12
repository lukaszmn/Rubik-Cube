import * as fs from 'fs';
import { cloneCube } from './clone-cube';
import { displayCube } from './display-cube';
import { movements } from './movements';
import { readCube } from './read-cube';
import { solverInterface } from './solver-interface';
import { MODE, STATE } from './state';
import { targetCube } from './target-cube';
import { clear, colors, highlight, logAndClearLine } from './terminal-output';
import { validate } from './validate';

let cursorX = 4, cursorY = 4;

export const processKeyInEdit = (keyName, shift, ctrl) => {
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
			};
			let face, cx, cy;
			if (cursorX <= 3) { face = STATE.c.L; cx = cursorX; cy = cursorY - 3; }
			else if (cursorX <= 6 && cursorY <= 3) { face = STATE.c.U; cx = cursorX - 3; cy = cursorY; }
			else if (cursorX <= 6 && cursorY <= 6) { face = STATE.c.F; cx = cursorX - 3; cy = cursorY - 3; }
			else if (cursorX <= 6 && cursorY <= 9) { face = STATE.c.D; cx = cursorX - 3; cy = cursorY - 6; }
			else if (cursorX <= 9) { face = STATE.c.R; cx = cursorX - 6; cy = cursorY - 3; }
			else if (cursorX <= 12) { face = STATE.c.B; cx = cursorX - 9; cy = cursorY - 3; }

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
			switch (STATE.mode) {
				case MODE.EDIT:
					STATE.mode = MODE.BROWSE;
					STATE.needsClearScreen = true;
					clear();
					displayCube(STATE.c);
					STATE.history.push(cloneCube(STATE.c));
					break;

				case MODE.OPTIMIZE_SOURCE:
					STATE.mode = MODE.OPTIMIZE_TARGET;
					STATE.optimize = {
						source: cloneCube(STATE.c),
						target: undefined,
						options: [],
						maxSteps: undefined,
					};
					STATE.needsClearScreen = true;
					processKeyInEdit(undefined, false, false);
					break;

				case MODE.OPTIMIZE_TARGET:
					STATE.mode = MODE.OPTIMIZE_CUSTOM;
					STATE.optimize.target = cloneCube(STATE.c);
					solverInterface();
					break;
			}
			return;

		case '=':
			STATE.c = readCube(targetCube);
			break;

		case 's':
			if (ctrl) {
				fs.writeFileSync('cube.json', JSON.stringify(STATE.c, null, 2));
				console.log('Saved');
				STATE.needsClearScreen = true;
				return;
			}
			break;

		case 'l':
			if (ctrl) {
				const fileContents = fs.readFileSync('cube.json', 'utf-8');
				STATE.c = JSON.parse(fileContents);
				console.log('Loaded');
				needsLaterClearScreen = true;
			}
			break;
	}

	switch (STATE.mode) {
		case MODE.EDIT: clear('E D I T   M O D E'); break;
		case MODE.OPTIMIZE_SOURCE: clear('O P T I M I Z E   -   E D I T   I N I T I A L   C U B E'); break;
		case MODE.OPTIMIZE_TARGET: clear('O P T I M I Z E   -   E D I T   T A R G E T   C U B E'); break;
	}

	console.log(
		'F2 - exit edit ' +
		'| arrow keys - move cursor ' +
		'| arrows + shift - move cube ' +
		'| = - reset cube ' +
		'| R/G/B/O/W/Y/- - place color, with shift - color entire face ' +
		'| CTRL + L/S - load/save state'
	);
	console.log();

	const res = validate(STATE.c);
	let s = '  Counts: ';
	s += Array.from('RGBOWY-')
		.map(col => {
			const formatColor = colors[col] || 'Q';
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
		mov(STATE.c);
	} else
		console.log();

	displayCube(STATE.c, cursorX, cursorY);

	if (needsLaterClearScreen)
		STATE.needsClearScreen = true;
};
