import * as fs from 'fs';

import { cloneCube } from '../cube-utils/clone-cube';
import { toCube, toOneLine } from '../cube-utils/cube-converters';
import { readCube } from '../cube-utils/read-cube';
import { targetCube } from '../cube-utils/target-cube';
import { validate } from '../cube-utils/validate';
import { MODE, STATE } from '../data/state';
import { movements } from '../movements';
import { alertInfo, displayCurrentCube, editor_showHints, editor_showValidation, redrawWithTitle } from '../UI/ui';
import { editor_showMovement, solverInterface } from '../UI/ui';
import { convertCursorPositionFromFace, convertCursorPositionToFace } from './cursor-position';
import { getCellsInDirection, paintCube, REPEAT_KEY_DIRECTION } from './paint-cube';

let cursorX = 4;
let cursorY = 4;

const repeatKey = {
	originalCube: undefined,
	key: undefined,
	cx02: undefined,
	cy02: undefined,
	direction: undefined,
	nextDirection: function() {
		if (++this.direction > Object.getOwnPropertyNames(REPEAT_KEY_DIRECTION).length)
			this.direction = 1;
	},
	reset: function() {
		this.originalCube = this.key = this.cx02 = this.cy02 = this.direction = undefined;
	},
};

const autoMovement = {
	highlightCells: undefined, // { highlight(1-2), face, x02, y02 }
	faceName: undefined,
	cx02: undefined, // 0-2
	cy02: undefined, // 0-2
	direction: undefined,
	index: undefined,
	prevDirection: function() {
		if (--this.direction < 1)
			this.direction = Object.getOwnPropertyNames(REPEAT_KEY_DIRECTION).length;
	},
	nextDirection: function() {
		if (++this.direction > Object.getOwnPropertyNames(REPEAT_KEY_DIRECTION).length)
			this.direction = 1;
	},
	reset: function() {
		this.faceName = this.cx02 = this.cy02 = this.direction = undefined;
		this.index = 0;

		const res = convertCursorPositionToFace(cursorX, cursorY);
		this.highlightCells = [
			{ highlight: 1, face: res.faceName, x02: res.cx02, y02: res.cy02 }
		];

		// debug
		// const res1 = convertCursorPositionFromFace(res.faceName, res.cx02, res.cy02);
		// if (res1.cursorX_1_12 !== cursorX || res1.cursorY_1_9 !== cursorY)
		// 	console.log({ok: res1.cursorX_1_12 === cursorX && res1.cursorY_1_9 === cursorY, cursorX, cursorY, res1});
	},
	proceed: function() {
		if (this.highlightCells.length <= 1)
			return;

		const prevCell = this.highlightCells[this.index];
		if (++this.index >= this.highlightCells.length)
			this.index = 0;
		const nextCell = this.highlightCells[this.index];
		prevCell.highlight = 2;
		nextCell.highlight = 1;
		const res = convertCursorPositionFromFace(nextCell.face, nextCell.x02, nextCell.y02);
		cursorX = res.cursorX_1_12;
		cursorY = res.cursorY_1_9;
	},
};

export const processKeyInEdit = (keyName, shift, ctrl) => {
	let movKey = undefined;
	let needsLaterClearScreen = false;

	if (autoMovement.cx02 === undefined)
		autoMovement.reset();

	switch (keyName) {
		case 'left':
			if (shift)
				movKey = 'y';
			else if (ctrl)
				cursorX -= 3;
			else
				--cursorX;
			[cursorX, cursorY] = getValidCursorPosition(cursorX, cursorY, keyName);
			autoMovement.reset();
			break;

		case 'right':
			if (shift)
				movKey = 'y_';
			else if (ctrl)
				cursorX += 3;
			else
				++cursorX;
			[cursorX, cursorY] = getValidCursorPosition(cursorX, cursorY, keyName);
			autoMovement.reset();
			break;

		case 'up':
			if (shift)
				movKey = 'x';
			else if (ctrl)
				cursorY -= 3;
			else
				--cursorY;
			[cursorX, cursorY] = getValidCursorPosition(cursorX, cursorY, keyName);
			autoMovement.reset();
			break;

		case 'down':
			if (shift)
				movKey = 'x_';
			else if (ctrl)
				cursorY += 3;
			else
				++cursorY;
			[cursorX, cursorY] = getValidCursorPosition(cursorX, cursorY, keyName);
			autoMovement.reset();
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

			const res1 = convertCursorPositionToFace(cursorX, cursorY);

			const color = keys[keyName].color;
			const entireFace = keys[keyName].face;

			if (res1.faceName) {

				let resetRepeatKey = true;
				if (!entireFace && repeatKey.key === keyName && repeatKey.cx02 === res1.cx02 && repeatKey.cy02 === res1.cy02) {
					resetRepeatKey = false;
					repeatKey.nextDirection();
					STATE.c = cloneCube(repeatKey.originalCube);
					paintCube(STATE.c, res1.faceName, res1.cx02, res1.cy02, repeatKey.direction, color);
				}

				if (resetRepeatKey) {
					if (!entireFace) {
						repeatKey.cx02 = res1.cx02;
						repeatKey.cy02 = res1.cy02;
						repeatKey.direction = REPEAT_KEY_DIRECTION.cell;
						repeatKey.key = keyName;
						repeatKey.originalCube = cloneCube(STATE.c);
						paintCube(STATE.c, res1.faceName, res1.cx02, res1.cy02, REPEAT_KEY_DIRECTION.cell, color);
					} else {
						repeatKey.reset();
						paintCube(STATE.c, res1.faceName, res1.cx02, res1.cy02, REPEAT_KEY_DIRECTION.face, color);
					}
				}

				autoMovement.proceed();

			}
			break;

		case 'pagedown':
		case 'pageup':
			const res2 = convertCursorPositionToFace(cursorX, cursorY);

			if (autoMovement.faceName === res2.faceName && autoMovement.cx02 === res2.cx02 && autoMovement.cy02 === res2.cy02) {
				if (keyName === 'pagedown')
					autoMovement.nextDirection();
				else
					autoMovement.prevDirection();
			} else {
				autoMovement.faceName = res2.faceName;
				autoMovement.cx02 = res2.cx02;
				autoMovement.cy02 = res2.cy02;
				autoMovement.direction = REPEAT_KEY_DIRECTION.cell;
				autoMovement.nextDirection();
			}

			let currentIndex = 0;
			autoMovement.highlightCells = getCellsInDirection(res2.faceName, res2.cx02, res2.cy02, autoMovement.direction)
				.map((cell, index) => {
					const highlight = (cell.face === res2.faceName && cell.x === res2.cx02 && cell.y === res2.cy02) ? 1 : 2;
					if (highlight === 1)
						currentIndex = index;
					return { highlight, face: cell.face, x02: cell.x, y02: cell.y };
				});
			autoMovement.index = currentIndex;
			break;

		case 'f2':
			switch (STATE.mode) {
				case MODE.EDIT:
					STATE.mode = MODE.BROWSE;
					STATE.needsClearScreen = true;
					redrawWithTitle();
					displayCurrentCube();
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
				alertInfo('Saved');
				STATE.needsClearScreen = true;
				return;
			}
			break;

		case 'l':
			if (ctrl) {
				const fileContents = fs.readFileSync('cube.json', 'utf-8');
				const data = JSON.parse(fileContents);
				STATE.c = toCube(data.cube);
				alertInfo('Loaded');
				needsLaterClearScreen = true;
			}
			break;
	}

	editor_showHints();

	const res = validate(STATE.c);
	editor_showValidation(res);

	const mov = movements[movKey];
	if (mov) {
		editor_showMovement(movKey.replace('_', "'"));
		mov(STATE.c);
	} else
		editor_showMovement('');

	displayCurrentCube({ highlightCells: autoMovement.highlightCells });

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
