import { displayCube } from './display-cube';
import { DIFF_MODE, STATE } from './state';

export const printDiffs = (previousCube, currentCube) => {
	if (STATE.showDiff === DIFF_MODE.NONE)
		return;

	console.log('\n\nPREVIOUS CUBE:');
	displayCube(getCubeDiff(previousCube, currentCube), undefined, true);

	if (STATE.showDiff === DIFF_MODE.PREVIOUS)
		return;

	console.log('\n\nCURRENT CUBE:');
	displayCube(getCubeDiff(currentCube, previousCube), undefined, true);
};

const getCubeDiff = (previousCube, currentCube) => ({
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
