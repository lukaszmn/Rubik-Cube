import * as CubeTypes from './cube-utils/identifier-cube';
import { DIFF_MODE, STATE } from './data/state';
import { showCurrentCubeDiff, showPreviousCubeDiff } from './UI/ui';

/**
 * @param {CubeTypes.Cube} previousCube
 * @param {CubeTypes.Cube} currentCube
 */
export const printDiffs = (previousCube, currentCube) => {
	if (STATE.showDiff === DIFF_MODE.NONE)
		return;

	showPreviousCubeDiff(getCubeDiff(previousCube, currentCube));

	if (STATE.showDiff === DIFF_MODE.PREVIOUS)
		return;

	showCurrentCubeDiff(getCubeDiff(currentCube, previousCube));
};

/**
 * @param {CubeTypes.Cube} previousCube
 * @param {CubeTypes.Cube} currentCube
 * @return {CubeTypes.Cube}
 */
const getCubeDiff = (previousCube, currentCube) => ({
	U: getFaceDiff(previousCube.U, currentCube.U),
	L: getFaceDiff(previousCube.L, currentCube.L),
	F: getFaceDiff(previousCube.F, currentCube.F),
	R: getFaceDiff(previousCube.R, currentCube.R),
	B: getFaceDiff(previousCube.B, currentCube.B),
	D: getFaceDiff(previousCube.D, currentCube.D),
});

/**
 * @param {CubeTypes.Face} previousFace
 * @param {CubeTypes.Face} currentFace
 * @return {CubeTypes.Face}
 */
export const getFaceDiff = (previousFace, currentFace) =>
	previousFace.map((_, index) => getRowDiff(previousFace[index], currentFace[index]));

/**
 * @param {CubeTypes.Row} previousRow
 * @param {CubeTypes.Row} currentRow
 * @return {CubeTypes.Row}
 */
export const getRowDiff = (previousRow, currentRow) =>
	previousRow.map((_, index) => previousRow[index] === currentRow[index] ? ' ' : previousRow[index]);
