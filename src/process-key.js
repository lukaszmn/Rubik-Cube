import { act, sleep } from './act';
import { printDiffs } from './cube-diff';
import { cloneCube } from './cube-utils/clone-cube';
import { toOneLine } from './cube-utils/cube-converters';
import { getIdentifierCube } from './cube-utils/identifier-cube';
import { readCube } from './cube-utils/read-cube';
import { scramble } from './cube-utils/scramble';
import { targetCube } from './cube-utils/target-cube';
import { saveState } from './data/persistence';
import { DIFF_MODE, MODE, STATE } from './data/state';
import { processKeyInEdit } from './editing/editor';
import { getMovementsForRotations } from './feats/movements-rotated';
import { movements } from './movements';
import { movementsAnimated } from './movements-animated';
import { movKeyToUser } from './movements-utils';
import { alertInfo, askQuestion, diffs_showMode, displayCurrentCube, main_showHelp, playing_showState, recording_answered,
	recording_started, recording_summary, redrawWithTitle, rotations_formula, rotations_started } from './UI/ui';

let wasPrime = false;

/**
 * @param {string} keyName
 * @param {boolean} shift
 * @param {boolean} ctrl
 */
export const processKey = async (keyName, shift, ctrl) => {
	let movKey = keyName + (wasPrime ? '_' : '');

	switch (keyName) {
		case "'": wasPrime = true; return;
		case 'left': movKey = shift ? 'z_' : 'y'; break;
		case 'right': movKey = shift ? 'z' : 'y_'; break;
		case 'up': movKey = 'x'; break;
		case 'down': movKey = 'x_'; break;

		case 'backspace':
			if (STATE.history.length > 1) {
				redrawWithTitle('Undo');
				const previousCube = STATE.history.pop() || new Error();
				STATE.c = cloneCube(STATE.history[STATE.history.length - 1]);
				displayCurrentCube();

				printDiffs(previousCube, STATE.c);
			}
			break;

		case 'f1':
			main_showHelp();

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
				recording_started();
			} else {
				STATE.mode = MODE.BROWSE;
				recording_summary();
				if (STATE.recording !== '') {
					askQuestion('Which key to save movements under? (0-9 or empty to cancel): ', answer => {
						recording_answered(answer);
						if (answer >= '0' && answer <= '9') {
							askQuestion('Enter name: ', answerName => {
								STATE.savedRecordings = STATE.savedRecordings.filter(x => x.key !== answer);
								STATE.savedRecordings.push({ key: answer, name: answerName, movements: STATE.recording });
								saveState();
								alertInfo('Saved');
							});
						} else {
							alertInfo('Canceled');
						}
						STATE.needsClearScreen = true;
					});
				}
			}
			break;

		case 'f4':
			if (STATE.mode === MODE.ROTATED_MOVEMENTS) {
				STATE.mode = MODE.BROWSE;
			} else {
				askQuestion('Type movements (UDLRFB udlrfb MES xyz) or saved recording # or reverse saved (e.g. 1\'): ', answer => {
					rotations_started();
					STATE.mode = MODE.ROTATED_MOVEMENTS;
					STATE.movementForRotation.movements = answer;
					STATE.movementForRotation.rotations = '';
					STATE.needsClearScreen = true;
				});
			}
			break;

		case 'f5':
			if (!ctrl) {
				const msg = 'Perform moves.\nType movements (UDLRFB udlrfb MES xyz) or saved recording # or reverse saved (e.g. 1\'): ';
				askQuestion(msg, answer => {
					act(STATE.c, 'summary', answer);
					STATE.history.push(cloneCube(STATE.c));
					STATE.needsClearScreen = true;
				});
			} else if (STATE.mode === MODE.RECORDED_MOVEMENTS_PLAY) {
				STATE.mode = MODE.BROWSE;
				STATE.needsClearScreen = true;
			} else {
				const msg = 'Play moves.\nType movements (UDLRFB udlrfb MES xyz) or saved recording # or reverse saved (e.g. 1\'): ';
				askQuestion(msg, answer => {
					STATE.mode = MODE.RECORDED_MOVEMENTS_PLAY;
					STATE.playing.init(STATE.c, answer);
					playing_showState();
					STATE.needsClearScreen = true;
				});
			}
			break;

		case 'pagedown':
			if (STATE.mode === MODE.ROTATED_MOVEMENTS_PLAY || STATE.mode === MODE.RECORDED_MOVEMENTS_PLAY) {
				const steps = STATE.playing.stepForward();
				if (steps) {
					await act(STATE.c, 'all', steps);
					playing_showState();
					STATE.needsClearScreen = true;
				}
			}
			break;

		case 'pageup':
			if (STATE.mode === MODE.ROTATED_MOVEMENTS_PLAY || STATE.mode === MODE.RECORDED_MOVEMENTS_PLAY) {
				const steps = STATE.playing.stepBackward();
				if (steps) {
					await act(STATE.c, 'all', steps);
					playing_showState();
					STATE.needsClearScreen = true;
				}
			}
			break;

		case 'home':
			if (STATE.mode === MODE.ROTATED_MOVEMENTS_PLAY || STATE.mode === MODE.RECORDED_MOVEMENTS_PLAY) {
				const steps = STATE.playing.goToStart();
				if (steps) {
					await act(STATE.c, 'all', steps);
					playing_showState();
					STATE.needsClearScreen = true;
				}
			}
			break;

		case 'end':
			if (STATE.mode === MODE.ROTATED_MOVEMENTS_PLAY || STATE.mode === MODE.RECORDED_MOVEMENTS_PLAY) {
				const steps = STATE.playing.goToEnd();
				if (steps) {
					await act(STATE.c, 'all', steps);
					playing_showState();
					STATE.needsClearScreen = true;
				}
			}
			break;

		case 'f6':
			STATE.mode = MODE.OPTIMIZE_SOURCE;
			STATE.needsClearScreen = true;
			processKeyInEdit(undefined, false, false);
			break;

		case 'f7':
			diffs_showMode();
			switch (STATE.showDiff) {
				case DIFF_MODE.NONE: STATE.showDiff = DIFF_MODE.PREVIOUS; break;
				case DIFF_MODE.PREVIOUS: STATE.showDiff = DIFF_MODE.BOTH; break;
				case DIFF_MODE.BOTH: STATE.showDiff = DIFF_MODE.NONE; break;
			}
			STATE.needsClearScreen = true;
			break;

		case 'f8':
			STATE.cellLabels = !STATE.cellLabels;
			redrawWithTitle();
			displayCurrentCube();
			break;

		case 'f9':
			askQuestion(`Current animation delay: ${STATE.animationSpeed} milliseconds. Enter new delay (0-disable): `, answer => {
				STATE.animationSpeed = +answer;
				STATE.needsClearScreen = true;
			});
			break;

		case '=':
			STATE.c = STATE.showColors ? readCube(targetCube) : getIdentifierCube();
			redrawWithTitle('Reset');
			STATE.history.push(cloneCube(STATE.c));
			displayCurrentCube();
			break;

		case '`':
			const scrambleRes = scramble(STATE.c, 1);
			STATE.c = scrambleRes.cube;
			redrawWithTitle('Scramble: ' + scrambleRes.path);
			STATE.history.push(cloneCube(STATE.c));
			displayCurrentCube();
			break;

		case '.':
			if (toOneLine(STATE.c).includes('5')) {
				STATE.c = readCube(targetCube);
				STATE.showColors = true;
				redrawWithTitle('Show colors');
			} else {
				STATE.c = getIdentifierCube();
				STATE.showColors = false;
				redrawWithTitle('Show identifiers');
				// TODO: at higher res show identifiers as color RGBOWY + number 1-9
			}
			STATE.history.push(cloneCube(STATE.c));
			displayCurrentCube();
			break;
	}

	wasPrime = false;

	const savedRecordingForKey = STATE.savedRecordings.find(x => x.key === keyName);
	if (savedRecordingForKey) {
		await act(STATE.c, 'summary', savedRecordingForKey.movements);
		STATE.history.push(cloneCube(STATE.c));
		STATE.needsClearScreen = true;
		return;
	}

	const mov = movements[movKey];
	if (mov) {
		const visibleMovement = movKeyToUser(movKey);

		if (STATE.animationSpeed > 0) {
			const anim = movementsAnimated[movKey](STATE.c);
			for (let animIndex = 0; animIndex < anim.length; ++animIndex) {
				const cubeAnim = anim[animIndex];

				redrawWithTitle('Movement: ' + visibleMovement);
				displayCurrentCube({ animate: cubeAnim });

				await sleep(STATE.animationSpeed);
			}
		}

		redrawWithTitle('Movement: ' + visibleMovement);
		mov(STATE.c);
		displayCurrentCube();
		STATE.history.push(cloneCube(STATE.c));

		if (STATE.mode === MODE.RECORD)
			STATE.recording += visibleMovement;
		else
			printDiffs(STATE.history[STATE.history.length - 2], STATE.c);

		if (STATE.mode === MODE.ROTATED_MOVEMENTS) {
			if ('xyz'.includes(movKey[0]))
				STATE.movementForRotation.rotations += visibleMovement;
			const steps = getMovementsForRotations(STATE.movementForRotation.rotations, STATE.movementForRotation.movements);
			rotations_formula(steps);
		}

		if (STATE.mode === MODE.ROTATED_MOVEMENTS_PLAY || STATE.mode === MODE.RECORDED_MOVEMENTS_PLAY) {
			if ('xyz'.includes(movKey[0]))
				STATE.playing.rotations += visibleMovement;
			playing_showState();
		}

	}
};
