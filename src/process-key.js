import { act } from './act';
import { cloneCube } from './clone-cube';
import { displayCube } from './display-cube';
import { processKeyInEdit } from './editor';
import { movements } from './movements';
import { question } from './question';
import { readCube } from './read-cube';
import { scramble } from './scramble';
import { MODE, STATE } from './state';
import { targetCube } from './target-cube';
import { clear } from './terminal-output';

let wasPrime = false;

export const processKey = (keyName, shift) => {
	let movKey = keyName + (wasPrime ? '_' : '');

	switch (keyName) {
		case "'": wasPrime = true; return;
		case 'left': movKey = shift ? 'z_' : 'y'; break;
		case 'right': movKey = shift ? 'z' : 'y_'; break;
		case 'up': movKey = 'x'; break;
		case 'down': movKey = 'x_'; break;

		case 'backspace':
			if (STATE.history.length > 1) {
				STATE.history.pop();
				STATE.c = cloneCube(STATE.history[STATE.history.length - 1]);
				clear('Undo');
				displayCube(STATE.c);
			}
			break;

		case 'f1':
			console.log('F1 - help');
			console.log('F2 - edit mode');
			console.log('F4 - perform moves');
			console.log('F6 - optimize algorithm');
			console.log('backspace - undo last move');
			console.log('arrow keys - rotate');
			console.log('= - reset');
			console.log('` - scramble');
			console.log('escape or CTRL+C - exit');
			console.log('Movements: UDLRFB udlrfb MES xyz');
			console.log("Press 'U to create movement U'");
			STATE.needsClearScreen = true;
			break;

		case 'f2':
			STATE.mode = MODE.EDIT;
			STATE.needsClearScreen = true;
			processKeyInEdit(undefined, false, false);
			break;

		case 'f4':
			question('Type movements (UDLRFB udlrfb MES xyz): ', answer => {
				act(STATE.c, 'summary', answer);
				STATE.history.push(cloneCube(STATE.c));
				STATE.needsClearScreen = true;
			});
			break;

		case 'f6':
			STATE.mode = MODE.OPTIMIZE_SOURCE;
			STATE.needsClearScreen = true;
			processKeyInEdit(undefined, false, false);
			break;

		case '=':
			STATE.c = readCube(targetCube);
			clear('Reset');
			STATE.history.push(cloneCube(STATE.c));
			displayCube(STATE.c);
			break;

		case '`':
			// const cube = readCube(targetCube);
			const scrambleRes = scramble(STATE.c, 1);
			STATE.c = scrambleRes.cube;
			clear('Scramble: ' + scrambleRes.path);
			STATE.history.push(cloneCube(STATE.c));
			displayCube(STATE.c);
			break;
	}

	const mov = movements[movKey];
	if (mov) {
		clear('Movement: ' + movKey.replace('_', "'"));
		mov(STATE.c);
		displayCube(STATE.c);
		STATE.history.push(cloneCube(STATE.c));
	}
	wasPrime = false;
};