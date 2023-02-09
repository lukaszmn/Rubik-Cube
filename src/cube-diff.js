import { DIFF_MODE, STATE } from './data/state';
import { showCurrentCubeDiff, showPreviousCubeDiff } from './UI/ui';

export const printDiffs = (previousCube, currentCube) => {
	if (STATE.showDiff === DIFF_MODE.NONE)
		return;

	showPreviousCubeDiff(getCubeDiff(previousCube, currentCube));

	if (STATE.showDiff === DIFF_MODE.PREVIOUS)
		return;

	showCurrentCubeDiff(getCubeDiff(currentCube, previousCube));
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
