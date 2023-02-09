import { movements } from '../movements';
import * as CubeTypes from './identifier-cube';

/**
 * @param {CubeTypes.Cube} cube
 * @param {number} count
 * @return {ScrambleRes}
 */
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

/**
 * @typedef ScrambleRes
 * @property {string} path
 * @property {CubeTypes.Cube} cube
 */
