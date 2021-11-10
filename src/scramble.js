import { movements } from './movements';

export const scramble = (cube, count) => {
	let path = '';
	for (let i = 0; i < count; ++i) {
		const movIndex = Math.floor(Math.random() * Object.keys(movements).length);
		const mov = Object.keys(movements)[movIndex];
		path += mov.replace('_', "'");
		movements[mov](cube);
	}
	return { path, cube };
};
