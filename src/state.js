import { cloneCube } from './clone-cube';

export const STATE = {
	c: {},
	history: [],
	editMode: false,
	typingMode: false,
	needsClearScreen: true,
};

export const initState = cube => {
	STATE.c = cloneCube(cube);
	STATE.history = [cloneCube(cube)];
	STATE.editMode = false;
	STATE.typingMode = false;
	STATE.needsClearScreen = true;
};
