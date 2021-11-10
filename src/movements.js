import { createSide } from './create-side';
import { rotateFace } from './rotate-face';

const transformCube = (faceToRotate, edge1, edge2, edge3, edge4) => {

	const copyEdge = (src, dest) => {
		for (let i = 0; i < src.edge.length; ++i) {
			const destRow = dest.edge[i][0];
			const destCol = dest.edge[i][1];
			const srcRow = src.edge[i][0];
			const srcCol = src.edge[i][1];
			dest.face[destRow][destCol] = src.face[srcRow][srcCol];
		}
	};
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

const columnDown = (face, index) => ({
	face,
	edge: [ '00 10 20', '01 11 21', '02 12 22'][index].split(' '),
});

const columnUp = (face, index) => ({
	face,
	edge: [ '20 10 00', '21 11 01', '22 12 02'][index].split(' '),
});

const rowLeft = (face, index) => ({
	face,
	edge: [ '00 01 02', '10 11 12', '20 21 22'][index].split(' '),
});

const rowRight = (face, index) => ({
	edge: [ '02 01 00', '12 11 10', '22 21 20'][index].split(' '),
	face,
});

const _movements = {
	U: cube => transformCube(cube.U, rowLeft(cube.L, 0), rowLeft(cube.B, 0), rowLeft(cube.R, 0), rowLeft(cube.F, 0)),
	D: cube => transformCube(cube.D, rowRight(cube.L, 2), rowRight(cube.F, 2), rowRight(cube.R, 2), rowRight(cube.B, 2)),
	L: cube => transformCube(cube.L, columnDown(cube.U, 0), columnDown(cube.F, 0), columnDown(cube.D, 0), columnUp(cube.B, 2)),
	R: cube => transformCube(cube.R, columnDown(cube.B, 0), columnUp(cube.D, 2), columnUp(cube.F, 2), columnUp(cube.U, 2)),
	F: cube => transformCube(cube.F, columnDown(cube.R, 0), rowLeft(cube.D, 0), columnUp(cube.L, 2), rowRight(cube.U, 2)),
	B: cube => transformCube(cube.B, columnDown(cube.L, 0), rowRight(cube.D, 2), columnUp(cube.R, 2), rowLeft(cube.U, 0)),

	M: cube => transformCube(null, columnDown(cube.U, 1), columnDown(cube.F, 1), columnDown(cube.D, 1), columnUp(cube.B, 1)),
	E: cube => transformCube(null, rowRight(cube.L, 1), rowRight(cube.F, 1), rowRight(cube.R, 1), rowRight(cube.B, 1)),
	S: cube => transformCube(null, columnDown(cube.R, 1), rowLeft(cube.D, 1), columnUp(cube.L, 1), rowRight(cube.U, 1)),
};

const prime = x => { x(); x(); x(); };

export const movements = {
	..._movements,
	// U_: cube => prime(() => _movements.U(cube)),
	// D_: cube => prime(() => _movements.D(cube)),
	// L_: cube => prime(() => _movements.L(cube)),
	// R_: cube => prime(() => _movements.R(cube)),
	// F_: cube => prime(() => _movements.F(cube)),
	// B_: cube => prime(() => _movements.B(cube)),

	// M_: cube => prime(() => _movements.M(cube)),
	// E_: cube => prime(() => _movements.E(cube)),
	// S_: cube => prime(() => _movements.S(cube)),

	// these undefined will be created in next statement
	M_: undefined,
	E_: undefined,
	S_: undefined,
	L_: undefined,
	D_: undefined,
	B_: undefined,

	u: cube => { _movements.U(cube); movements.E_(cube); },
	d: cube => { _movements.D(cube); movements.E(cube); },
	l: cube => { _movements.L(cube); movements.M(cube); },
	r: cube => { _movements.R(cube); movements.M_(cube); },
	f: cube => { _movements.F(cube); movements.S(cube); },
	b: cube => { _movements.B(cube); movements.S_(cube); },

	// u_: cube => prime(() => movements.u(cube)),
	// d_: cube => prime(() => movements.d(cube)),
	// r_: cube => prime(() => movements.r(cube)),
	// l_: cube => prime(() => movements.l(cube)),
	// f_: cube => prime(() => movements.f(cube)),
	// b_: cube => prime(() => movements.b(cube)),

	x: cube => { movements.r(cube); movements.L_(cube); },
	y: cube => { movements.u(cube); movements.D_(cube); },
	z: cube => { movements.f(cube); movements.B_(cube); },
	// X_: cube => { _movements.X(cube); _movements.X(cube); _movements.X(cube); },
};

for (const key in movements)
	movements[key + '_'] = cube => prime(() => movements[key](cube));
