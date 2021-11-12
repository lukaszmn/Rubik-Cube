import { cloneCube } from './clone-cube';

export const MODE = {
	BROWSE: 1,
	EDIT: 2,
	OPTIMIZE_SOURCE: 3,
	OPTIMIZE_TARGET: 4,
	OPTIMIZE_CUSTOM: 5,
	RECORD: 6,
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
};

export const initState = (cube) => {
	STATE.c = cloneCube(cube);
	STATE.history = [ cloneCube(cube) ];
	STATE.mode = MODE.BROWSE;
	STATE.typingMode = false;
	STATE.needsClearScreen = true;
	STATE.optimize = {};
	STATE.recording = '';
	STATE.savedRecordings = [];
};
