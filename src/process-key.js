import { act } from './act';
import { cloneCube } from './clone-cube';
import { toCube, toOneLine } from './cube-converters';
import { displayCube } from './display-cube';
import { processKeyInEdit } from './editor';
import { getIdentifierCube } from './identifier-cube';
import { movements } from './movements';
import { saveState } from './persistence';
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
				displayCube(STATE.c, STATE.showColors);
			}
			break;

		case 'f1':
			console.log('F1 - help');
			console.log('F2 - edit mode');
			console.log('F3 - record movements');
			console.log('F4 - perform moves');
			console.log('F6 - optimize algorithm');
			console.log('backspace - undo last move');
			console.log('arrow keys - rotate');
			console.log('= - reset');
			console.log('` - scramble');
			console.log('. - toggle identifiers/colors');
			console.log('escape or CTRL+C - exit');
			console.log('Movements: UDLRFB udlrfb MES xyz');
			console.log("Press 'U to create movement U'");
			console.log();

			console.log('Saved recordings:');
			for (const rec of STATE.savedRecordings)
				console.log(`  ${rec.key}: ${rec.movements}`);

			STATE.needsClearScreen = true;
			break;

		case 'f2':
			STATE.mode = MODE.EDIT;
			STATE.needsClearScreen = true;
			processKeyInEdit(undefined, false, false);
			break;

		case 'f3':
			if (STATE.mode !== MODE.RECORD) {
				STATE.mode = MODE.RECORD;
				STATE.recording = '';
				STATE.needsClearScreen = true;
				console.log('Recording movements. Press F3 again to save');
			} else {
				STATE.mode = MODE.BROWSE;
				if (STATE.recording === '') {
					console.log('No movements were recorded');
				} else {
					console.log('Recorded movements:');
					for (const rec of STATE.savedRecordings)
						console.log(`  ${rec.key}: ${rec.movements}`);
					console.log(`  <CURRENT>: ${STATE.recording}`);

					question('Which key to save movements under? (0-9 or empty to cancel): ', answer => {
						// TODO: fails after second time - answer contains movements
						console.log(`ANSWER ${answer}`);
						if (answer >= '0' && answer <= '9') {
							// TODO: ask for name
							STATE.savedRecordings = STATE.savedRecordings.filter(x => x.key !== answer);
							STATE.savedRecordings.push({ key: answer, movements: STATE.recording });
							saveState();
							console.log('Saved');
						} else {
							console.log('Canceled');
						}
						STATE.needsClearScreen = true;
					});
				}
			}
			break;

		case 'f4':
			question('Type movements (UDLRFB udlrfb MES xyz): ', answer => {
				act(STATE.c, 'summary', answer, STATE.showColors);
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
			displayCube(STATE.c, STATE.showColors);
			break;

		case '`':
			const scrambleRes = scramble(STATE.c, 1);
			STATE.c = scrambleRes.cube;
			clear('Scramble: ' + scrambleRes.path);
			STATE.history.push(cloneCube(STATE.c));
			displayCube(STATE.c, STATE.showColors);
			break;

		case '.':
			if (toOneLine(STATE.c).includes('5')) {
				STATE.c = readCube(targetCube);
				STATE.showColors = true;
				clear('Show colors');
			} else {
				STATE.c = getIdentifierCube();
				STATE.showColors = false;
				clear('Show identifiers');
				// TODO: at higher res show identifiers as color RGBOWY + number 1-9
			}
			STATE.history.push(cloneCube(STATE.c));
			displayCube(STATE.c, STATE.showColors);
			break;
	}

	wasPrime = false;

	const savedRecordingForKey = STATE.savedRecordings.find(x => x.key === keyName);
	if (savedRecordingForKey) {
		act(STATE.c, 'summary', savedRecordingForKey.movements, STATE.showColors);
		STATE.history.push(cloneCube(STATE.c));
		STATE.needsClearScreen = true;
		return;
	}

	const mov = movements[movKey];
	if (mov) {
		const visibleMovement = movKey.replace('_', "'");
		clear('Movement: ' + visibleMovement);
		mov(STATE.c);
		displayCube(STATE.c, STATE.showColors);
		STATE.history.push(cloneCube(STATE.c));

		if (STATE.mode === MODE.RECORD)
			STATE.recording += visibleMovement;
	}
};
