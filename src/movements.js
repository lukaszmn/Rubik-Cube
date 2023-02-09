import { createSide } from './cube-utils/create-side';
import * as CubeTypes from './cube-utils/identifier-cube';
import { rotateFace } from './cube-utils/rotate-face';

/**
 * @param {CubeTypes.Face | null} faceToRotate
 * @param {Edge} edge1
 * @param {Edge} edge2
 * @param {Edge} edge3
 * @param {Edge} edge4
 */
const transformCube = (faceToRotate, edge1, edge2, edge3, edge4) => {

	/**
	 * @param {Edge} src
	 * @param {Edge} dest
	 */
	const copyEdge = (src, dest) => {
		for (let i = 0; i < src.edge.length; ++i) {
			const destRow = dest.edge[i][0];
			const destCol = dest.edge[i][1];
			const srcRow = src.edge[i][0];
			const srcCol = src.edge[i][1];
			dest.face[destRow][destCol] = src.face[srcRow][srcCol];
		}
	};

	/**
	 * @param {CubeTypes.Face} src
	 * @param {CubeTypes.Face} dest
	 */
	const copy2DArray = (src, dest) => {
		for (let rowIndex = 0; rowIndex < dest.length; ++rowIndex) {
			const row = dest[rowIndex];
			for (let colIndex = 0; colIndex < row.length; ++colIndex)
				dest[rowIndex][colIndex] = src[rowIndex][colIndex];
		}
	};

	if (faceToRotate) {
		const rotatedFace = rotateFace(faceToRotate);
		copy2DArray(rotatedFace, faceToRotate);
	}

	const tmp = {
		face: createSide(),
		edge: edge1.edge,
	};
	copy2DArray(edge1.face, tmp.face);
	copyEdge(edge1, tmp);
	copyEdge(edge4, edge1);
	copyEdge(edge3, edge4);
	copyEdge(edge2, edge3);
	copyEdge(tmp, edge2);
};

/** @typedef {{ face: CubeTypes.Face, edge: string[] }} Edge */

/**
 * @param {CubeTypes.Face} face
 * @param {number} col
 * @return {Edge}
 */
const columnDown = (face, col) => ({
	face,
	edge: Array.from('012').map(row => `${row}${col}`),
});

/**
 * @param {CubeTypes.Face} face
 * @param {number} col
 * @return {Edge}
 */
const columnUp = (face, col) => ({
	face,
	edge: Array.from('210').map(row => `${row}${col}`),
});

/**
 * @param {CubeTypes.Face} face
 * @param {number} row
 * @return {Edge}
 */
const rowLeft = (face, row) => ({
	face,
	edge: Array.from('210').map(col => `${row}${col}`),
});

/**
 * @param {CubeTypes.Face} face
 * @param {number} row
 * @return {Edge}
 */
const rowRight = (face, row) => ({
	face,
	edge: Array.from('012').map(col => `${row}${col}`),
});

const _movements = {
	U: cube => transformCube(cube.U, rowLeft(cube.L, 0), rowLeft(cube.B, 0), rowLeft(cube.R, 0), rowLeft(cube.F, 0)),
	D: cube => transformCube(cube.D, rowRight(cube.L, 2), rowRight(cube.F, 2), rowRight(cube.R, 2), rowRight(cube.B, 2)),
	L: cube => transformCube(cube.L, columnDown(cube.U, 0), columnDown(cube.F, 0), columnDown(cube.D, 0), columnUp(cube.B, 2)),
	R: cube => transformCube(cube.R, columnDown(cube.B, 0), columnUp(cube.D, 2), columnUp(cube.F, 2), columnUp(cube.U, 2)),
	F: cube => transformCube(cube.F, columnDown(cube.R, 0), rowLeft(cube.D, 0), columnUp(cube.L, 2), rowRight(cube.U, 2)),
	B: cube => transformCube(cube.B, columnDown(cube.L, 0), rowRight(cube.D, 2), columnUp(cube.R, 2), rowLeft(cube.U, 0)),

	// M - middle (parallel to R) down (mid col)
	// E - middle (parallel to U) right (mid row)
	// S - middle (parallel to F) right (mid plane)
	M: cube => transformCube(null, columnDown(cube.U, 1), columnDown(cube.F, 1), columnDown(cube.D, 1), columnUp(cube.B, 1)),
	E: cube => transformCube(null, rowRight(cube.L, 1), rowRight(cube.F, 1), rowRight(cube.R, 1), rowRight(cube.B, 1)),
	S: cube => transformCube(null, columnDown(cube.R, 1), rowLeft(cube.D, 1), columnUp(cube.L, 1), rowRight(cube.U, 1)),
};

export const movements = {
	..._movements,

	// these undefined will be created in next statement
	M_: cube => {},
	E_: cube => {},
	S_: cube => {},
	L_: cube => {},
	D_: cube => {},
	B_: cube => {},

	u: cube => { _movements.U(cube); movements.E_(cube); },
	d: cube => { _movements.D(cube); movements.E(cube); },
	l: cube => { _movements.L(cube); movements.M(cube); },
	r: cube => { _movements.R(cube); movements.M_(cube); },
	f: cube => { _movements.F(cube); movements.S(cube); },
	b: cube => { _movements.B(cube); movements.S_(cube); },

	// x - up (like R), y - left (life U), z - rotate cube like F
	x: cube => { movements.r(cube); movements.L_(cube); },
	y: cube => { movements.u(cube); movements.D_(cube); },
	z: cube => { movements.f(cube); movements.B_(cube); },
};

const reverse = x => { x(); x(); x(); };

for (const key in movements) {
	if (!key.endsWith('_'))
		movements[key + '_'] = cube => reverse(() => movements[key](cube));
}
