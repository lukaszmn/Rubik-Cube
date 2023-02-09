import { cloneCube } from '../cube-utils/clone-cube';
import * as CubeTypes from '../cube-utils/identifier-cube';
import { getIdentifierCube } from '../cube-utils/identifier-cube';

/**
 * @typedef StateMode
 * @property {StateModeValue} BROWSE
 * @property {StateModeValue} EDIT
 * @property {StateModeValue} OPTIMIZE_SOURCE
 * @property {StateModeValue} OPTIMIZE_TARGET
 * @property {StateModeValue} OPTIMIZE_CUSTOM
 * @property {StateModeValue} RECORD
 * @property {StateModeValue} ROTATED_MOVEMENTS
 */
/**
 * @typedef StateModeValue
 * @type {number}
 */
/**
 * @type {StateMode}
 */
export const MODE = {
	BROWSE: 1,
	EDIT: 2,
	OPTIMIZE_SOURCE: 3,
	OPTIMIZE_TARGET: 4,
	OPTIMIZE_CUSTOM: 5,
	RECORD: 6,
	ROTATED_MOVEMENTS: 7,
};

/**
 * @typedef StateDiffMode
 * @property {StateDiffModeValue} NONE
 * @property {StateDiffModeValue} PREVIOUS
 * @property {StateDiffModeValue} BOTH
 */
/**
 * @typedef StateDiffModeValue
 * @type {number}
 */
/**
 * @type {StateDiffMode}
 */
export const DIFF_MODE = {
	NONE: 0,
	PREVIOUS: 1,
	BOTH: 2,
};

/**
 * @typedef State
 * @property {CubeTypes.Cube} c
 * @property {CubeTypes.Cube[]} history
 * @property {StateModeValue} mode
 * @property {boolean} typingMode
 * @property {boolean} needsClearScreen
 * @property {Optimize | undefined} optimize
 * @property {string} recording
 * @property {SavedRecording[]} savedRecordings
 * @property {boolean} showColors
 * @property {StateDiffModeValue} showDiff
 * @property {boolean} cellLabels
 * @property {MovementForRotation} movementForRotation
 */
/**
 * @type {State}
 */
export const STATE = {
	c: getIdentifierCube(), // cube
	history: [],
	mode: MODE.BROWSE,
	typingMode: false,
	needsClearScreen: true,
	optimize: undefined,
	recording: '',
	savedRecordings: [], // { key: '0', name: '', movements: 'RUR' }
	showColors: true,
	showDiff: DIFF_MODE.NONE,
	cellLabels: true,
	movementForRotation: { movements: '', rotations: '' },
};

/**
 * @typedef Optimize
 * @property {CubeTypes.Cube} source
 * @property {CubeTypes.Cube} target
 * @property {OptimizeOption[]} options
 * @property {number} maxSteps
 */
/**
 * @typedef OptimizeOption
 * @property {string} name
 * @property {string} movements
 */

/**
 * @typedef SavedRecording
 * @property {string} key
 * @property {string} name
 * @property {string} movements
 */

/**
 * @typedef MovementForRotation
 * @property {string} movements
 * @property {string} rotations
 */

export const initState = cube => {
	STATE.c = cloneCube(cube);
	STATE.history = [ cloneCube(cube) ];
	STATE.mode = MODE.BROWSE;
	STATE.typingMode = false;
	STATE.needsClearScreen = true;
	STATE.optimize = undefined;
	STATE.recording = '';
	STATE.savedRecordings = [];
	STATE.showColors = true;
	STATE.showDiff = DIFF_MODE.NONE;
	STATE.cellLabels = true;
	STATE.movementForRotation = { movements: '', rotations: '' };
};
