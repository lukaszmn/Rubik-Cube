export const getCubeDiff = (previousCube, currentCube) => ({
	U: getFaceDiff(previousCube.U, currentCube.U),
	L: getFaceDiff(previousCube.L, currentCube.L),
	F: getFaceDiff(previousCube.F, currentCube.F),
	R: getFaceDiff(previousCube.R, currentCube.R),
	B: getFaceDiff(previousCube.B, currentCube.B),
	D: getFaceDiff(previousCube.D, currentCube.D),
});

export const getFaceDiff = (previousFace, currentFace) =>
	previousFace.map((_, index) => getRowDiff(previousFace[index], currentFace[index]));

export const getRowDiff = (previousRow, currentRow) =>
	previousRow.map((_, index) => previousRow[index] === currentRow[index] ? ' ' : previousRow[index]);
