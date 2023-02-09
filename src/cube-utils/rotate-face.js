import * as CubeTypes from './identifier-cube';

/**
 * @param {CubeTypes.Face} source
 * @param {string[]} transform
 * @return {CubeTypes.Face}
 */
const readTransform = (source, transform) => {
	const rowsWithCells = transform.map(s => s.split(' '));
	return rowsWithCells.map(row => row.map(cell => {
		const a = +cell[0];
		const b = +cell[1];
		return source[a][b];
	}));
};

/**
 * @param {CubeTypes.Face} face
 * @return {CubeTypes.Face}
 */
export const rotateFace = face => readTransform(face, [
	'20 10 00',
	'21 11 01',
	'22 12 02',
]);
