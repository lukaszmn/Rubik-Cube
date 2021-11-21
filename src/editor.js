import * as fs from 'fs';
import { cloneCube } from './clone-cube';
import { paintCube, REPEAT_KEY_DIRECTION } from './paint-cube';
import { toCube, toOneLine } from './cube-converters';
import { displayCube } from './display-cube';
import { movements } from './movements';
import { readCube } from './read-cube';
import { solverInterface } from './solver-interface';
import { MODE, STATE } from './state';
import { targetCube } from './target-cube';
import { clear, colors, highlight, logAndClearLine } from './terminal-output';
import { validate } from './validate';

let cursorX = 4, cursorY = 4;

const repeatKey = {
	originalCube: undefined,
	key: undefined,
	cx: undefined,
	cy: undefined,
	direction: undefined,
	nextDirection: function() {
		if (++this.direction > Object.getOwnPropertyNames(REPEAT_KEY_DIRECTION).length)
			this.direction = 1;
	},
	reset: function() {
		this.originalCube = this.key = this.cx = this.cy = this.direction = undefined;
	},
};

export const processKeyInEdit = (keyName, shift, ctrl) => {
	let movKey = undefined;
	let needsLaterClearScreen = false;

	switch (keyName) {
		case 'left':
			if (shift)
				movKey = 'y';
			else if (ctrl)
				cursorX -= 3;
			else
				--cursorX;
			[cursorX, cursorY] = getValidCursorPosition(cursorX, cursorY, keyName);
			break;
		case 'right':
			if (shift)
				movKey = 'y_';
			else if (ctrl)
				cursorX += 3;
			else
				++cursorX;
			[cursorX, cursorY] = getValidCursorPosition(cursorX, cursorY, keyName);
			break;
		case 'up':
			if (shift)
				movKey = 'x';
			else if (ctrl)
				cursorY -= 3;
			else
				--cursorY;
			[cursorX, cursorY] = getValidCursorPosition(cursorX, cursorY, keyName);
			break;
		case 'down':
			if (shift)
				movKey = 'x_';
			else if (ctrl)
				cursorY += 3;
			else
				++cursorY;
			[cursorX, cursorY] = getValidCursorPosition(cursorX, cursorY, keyName);
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

			let cx, cy, faceName;
			if (cursorX <= 3) { faceName = 'L'; cx = cursorX; cy = cursorY - 3; }
			else if (cursorX <= 6 && cursorY <= 3) { faceName = 'U'; cx = cursorX - 3; cy = cursorY; }
			else if (cursorX <= 6 && cursorY <= 6) { faceName = 'F'; cx = cursorX - 3; cy = cursorY - 3; }
			else if (cursorX <= 6 && cursorY <= 9) { faceName = 'D'; cx = cursorX - 3; cy = cursorY - 6; }
			else if (cursorX <= 9) { faceName = 'R'; cx = cursorX - 6; cy = cursorY - 3; }
			else if (cursorX <= 12) { faceName = 'B'; cx = cursorX - 9; cy = cursorY - 3; }

			const color = keys[keyName].color;
			const entireFace = keys[keyName].face;

			if (faceName) {

				let resetRepeatKey = true;
				if (!entireFace && repeatKey.key === keyName && repeatKey.cx === cx && repeatKey.cy === cy) {
					resetRepeatKey = false;
					repeatKey.nextDirection();
					STATE.c = cloneCube(repeatKey.originalCube);
					paintCube(STATE.c, faceName, cx, cy, repeatKey.direction, color);
				}

				if (resetRepeatKey) {
					if (!entireFace) {
						repeatKey.cx = cx;
						repeatKey.cy = cy;
						repeatKey.direction = REPEAT_KEY_DIRECTION.cell;
						repeatKey.key = keyName;
						repeatKey.originalCube = cloneCube(STATE.c);
						paintCube(STATE.c, faceName, cx, cy, REPEAT_KEY_DIRECTION.cell, color);
					} else {
						repeatKey.reset();
						paintCube(STATE.c, faceName, cx, cy, REPEAT_KEY_DIRECTION.face, color);
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
				const data = {
					'cube': toOneLine(STATE.c, true),
				};
				fs.writeFileSync('cube.json', JSON.stringify(data, null, 2));
				console.log('Saved');
				STATE.needsClearScreen = true;
				return;
			}
			break;

		case 'l':
			if (ctrl) {
				const fileContents = fs.readFileSync('cube.json', 'utf-8');
				const data = JSON.parse(fileContents);
				STATE.c = toCube(data.cube);
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
		'| SHIFT + arrows - move cube ' +
		'| CTRL + arrows - go to face ' +
		'| PG UP/DOWN - cursor auto movement mode '
	);
	console.log(
		'               ' +
		'| R/G/B/O/W/Y/- - place color, with SHIFT - color entire face, repeat key for more modes ' +
		'| = - reset cube ' +
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

	displayCube(STATE.c, cursorX, cursorY, true);

	if (needsLaterClearScreen)
		STATE.needsClearScreen = true;
};

const getValidCursorPosition = (cursorX, cursorY, direction) => {
	const horizontal = direction === 'left' || direction === 'right';
	const vertical = !horizontal;

	if (horizontal && cursorY >= 4 && cursorY <= 6) {
		cursorX = Math.max(cursorX, 1);
		cursorX = Math.min(cursorX, 12);
	} else if (horizontal && cursorY >= 1 && cursorY <= 9) {
		cursorX = Math.max(cursorX, 4);
		cursorX = Math.min(cursorX, 6);
	} else if (vertical && cursorX >= 4 && cursorX <= 6) {
		cursorY = Math.max(cursorY, 1);
		cursorY = Math.min(cursorY, 9);
	} else if (vertical && cursorX >= 1 && cursorX <= 12) {
		cursorY = Math.max(cursorY, 4);
		cursorY = Math.min(cursorY, 6);
	}

	return [ cursorX, cursorY ];
};
