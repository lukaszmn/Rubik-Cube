import { cloneCube } from './clone-cube';

export const MODE = {
	BROWSE: 1,
	EDIT: 2,
	OPTIMIZE_SOURCE: 3,
	OPTIMIZE_TARGET: 4,
	OPTIMIZE_CUSTOM: 5,
	RECORD: 6,
	ROTATED_MOVEMENTS: 7,
};

export const DIFF_MODE = {
	NONE: 0,
	PREVIOUS: 1,
	BOTH: 2,
};

export const STATE = {
	c: {}, // cube
	history: [],
	mode: MODE.BROWSE,
	typingMode: false,
	needsClearScreen: true,
	optimize: {},
	recording: '',
	savedRecordings: [], // { key: '0', movements: 'RUR' }
	showColors: true,
	showDiff: DIFF_MODE.NONE,
	cellLabels: true,
	movementForRotation: { movements: '', rotations: '' },
};

export const initState = cube => {
	STATE.c = cloneCube(cube);
	STATE.history = [ cloneCube(cube) ];
	STATE.mode = MODE.BROWSE;
	STATE.typingMode = false;
	STATE.needsClearScreen = true;
	STATE.optimize = {};
	STATE.recording = '';
	STATE.savedRecordings = [];
	STATE.showColors = true;
	STATE.showDiff = DIFF_MODE.NONE;
	STATE.cellLabels = true;
	STATE.movementForRotation = { movements: '', rotations: '' };
};
