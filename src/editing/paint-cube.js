import * as CubeTypes from '../cube-utils/identifier-cube';

/**
 * @param {CubeTypes.Cube} cube
 * @param {string} faceName
 * @param {number} cx02
 * @param {number} cy02
 * @param {DirectionValue} direction
 * @param {string} color
 */
export const paintCube = (cube, faceName, cx02, cy02, direction, color) => {
	const cells = getCellsInDirection(faceName, cx02, cy02, direction);
	for (const cell of cells)
		cube[cell.face][cell.y][cell.x] = color;
};

/**
 * @param {string} faceName
 * @param {number} cx02
 * @param {number} cy02
 * @param {DirectionValue} direction
 * @return {Cell[]}
 */
export const getCellsInDirection = (faceName, cx02, cy02, direction) => {

	/** @type {Cell[]} */
	const cells = [];

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {string} [face]
	 */
	const addCell = (x, y, face) => { cells.push({ x, y, face: face || faceName }); };

	switch (direction) {

		case REPEAT_KEY_DIRECTION.cell:
			addCell(cx02, cy02);
			break;

		case REPEAT_KEY_DIRECTION.face:
			for (cy02 = 0; cy02 < 3; ++cy02) {
				for (cx02 = 0; cx02 < 3; ++cx02)
					addCell(cx02, cy02);
			}
			break;

		case REPEAT_KEY_DIRECTION.rowFace:
			for (cx02 = 0; cx02 < 3; ++cx02)
				addCell(cx02, cy02);
			break;

		case REPEAT_KEY_DIRECTION.columnFace:
			for (cy02 = 0; cy02 < 3; ++cy02)
				addCell(cx02, cy02);
			break;

		case REPEAT_KEY_DIRECTION.rowAll:
			const rowInfo = getRowInfo(faceName, cy02);
			// console.log({x: 'rowAll', faceName, cx02, cy02, rowInfo});
			const cells1 = getCells(rowInfo);
			for (const cell of cells1)
				addCell(cell.column, cell.row, cell.face);
			break;

		case REPEAT_KEY_DIRECTION.columnAll:
			const columnInfo = getColumnInfo(faceName, cx02);
			// console.log({x: 'columnAll', faceName, cx, cy02, columnInfo});
			const cells2 = getCells(columnInfo);
			for (const cell of cells2)
				addCell(cell.column, cell.row, cell.face);
			break;
	}

	return cells;
};

/**
 * @typedef DirectionValue
 * @type {number}
*/
/**
 * @typedef Direction
 * @property {DirectionValue} cell
 * @property {DirectionValue} face
 * @property {DirectionValue} rowFace
 * @property {DirectionValue} rowAll
 * @property {DirectionValue} columnFace
 * @property {DirectionValue} columnAll
 */
/** @type {Direction} */
export const REPEAT_KEY_DIRECTION = {
	cell: 1,
	face: 2,
	rowFace: 3,
	rowAll: 4,
	columnFace: 5,
	columnAll: 6,
};

/**
 * @param {string} faceName
 * @param {number} cy02
 * @return {RowColumnInfo[]}
 */
const getRowInfo = (faceName, cy02) => {
	const rowMap = {
		/** @param {number} row
		 * @return {RowColumnInfo[]} */
		U: row => [
			{ face: 'U', row: row, columns: '012' },
			{ face: 'R', rows: '012', column: 2 - row },
			{ face: 'D', row: 2 - row, columns: '210' },
			{ face: 'L', rows: '210', column: row },
		],
		/** @param {number} row
		 * @return {RowColumnInfo[]} */
		D: row => [
			{ face: 'D', row: row, columns: '210' },
			{ face: 'L', rows: '210', column: 2 - row },
			{ face: 'U', row: 2 - row, columns: '012' },
			{ face: 'R', rows: '012', column: row },
		],
		/** @param {number} row
		 * @return {RowColumnInfo[]} */
		L: row => [
			{ face: 'L', row: row, columns: '012' },
			{ face: 'F', row: row, columns: '012' },
			{ face: 'R', row: row, columns: '012' },
			{ face: 'B', row: row, columns: '012' },
		],
		/** @param {number} row
		 * @return {RowColumnInfo[]} */
		F: row => [
			{ face: 'F', row: row, columns: '012' },
			{ face: 'R', row: row, columns: '012' },
			{ face: 'B', row: row, columns: '012' },
			{ face: 'L', row: row, columns: '012' },
		],
		/** @param {number} row
		 * @return {RowColumnInfo[]} */
		R: row => [
			{ face: 'R', row: row, columns: '012' },
			{ face: 'B', row: row, columns: '012' },
			{ face: 'L', row: row, columns: '012' },
			{ face: 'F', row: row, columns: '012' },
		],
		/** @param {number} row
		 * @return {RowColumnInfo[]} */
		B: row => [
			{ face: 'B', row: row, columns: '012' },
			{ face: 'L', row: row, columns: '012' },
			{ face: 'F', row: row, columns: '012' },
			{ face: 'R', row: row, columns: '012' },
		],
	};
	return rowMap[faceName](cy02);
};

/**
 * @param {string} faceName
 * @param {number} cx02
 * @return {RowColumnInfo[]}
 */
const getColumnInfo = (faceName, cx02) => {
	const columnMap = {
		/** @param {number} column
		 *  @return {RowColumnInfo[]} */
		U: column => [
			{ face: 'U', rows: '012', column: column },
			{ face: 'F', rows: '012', column: column },
			{ face: 'D', rows: '012', column: column },
			{ face: 'B', rows: '210', column: 2 - column },
		],
		/** @param {number} column
		 *  @return {RowColumnInfo[]} */
		F: column => [
			{ face: 'F', rows: '012', column: column },
			{ face: 'D', rows: '012', column: column },
			{ face: 'B', rows: '210', column: 2 - column },
			{ face: 'U', rows: '012', column: column },
		],
		/** @param {number} column
		 *  @return {RowColumnInfo[]} */
		D: column => [
			{ face: 'D', rows: '012', column: column },
			{ face: 'B', rows: '210', column: 2 - column },
			{ face: 'U', rows: '012', column: column },
			{ face: 'F', rows: '012', column: column },
		],
		/** @param {number} column
		 *  @return {RowColumnInfo[]} */
		B: column => [
			{ face: 'B', rows: '210', column: column },
			{ face: 'U', rows: '012', column: 2 - column },
			{ face: 'F', rows: '012', column: 2 - column },
			{ face: 'D', rows: '012', column: 2 - column },
		],
		/** @param {number} column
		 *  @return {RowColumnInfo[]} */
		L: column => [
			{ face: 'L', rows: '210', column: column },
			{ face: 'U', row: column, columns: '012' },
			{ face: 'R', rows: '012', column: 2 - column },
			{ face: 'D', row: 2 - column, columns: '210' },
		],
		/** @param {number} column
		 *  @return {RowColumnInfo[]} */
		R: column => [
			{ face: 'R', rows: '012', column: column },
			{ face: 'D', row: column, columns: '210' },
			{ face: 'L', rows: '210', column: 2 - column },
			{ face: 'U', row: 2 - column, columns: '012' },
		],
	};
	return columnMap[faceName](cx02);
};

/**
 * @param {RowColumnInfo[]} facesInfo
 * @return {Cell1[]}
 */
const getCells = facesInfo => {
	/** @type {Cell1[]} */
	const cells = [];

	for (const faceInfo of facesInfo) {
		if (faceInfo.row != undefined && faceInfo.rows != undefined)
			throw new Error('Both row & rows defined');
		if (faceInfo.column != undefined && faceInfo.columns != undefined)
			throw new Error('Both column & columns defined');
		if (faceInfo.rows != undefined && faceInfo.columns != undefined)
			throw new Error('Both rows & columns defined');

		if (faceInfo.row !== undefined) {
			if (faceInfo.columns === undefined) throw new Error();
			for (const col of Array.from(faceInfo.columns))
				cells.push({ face: faceInfo.face, row: faceInfo.row, column: +col });
		}
		if (faceInfo.column != undefined) {
			if (faceInfo.rows === undefined) throw new Error();
			for (const row of Array.from(faceInfo.rows))
				cells.push({ face: faceInfo.face, row: +row, column: faceInfo.column });
		}
	}

	if (cells.length !== 12) {
		console.log('Debug', { facesInfo, cells });
		throw new Error('Invalid amount of cells: ' + cells.length);
	}

	return cells;
};

/**
 * @typedef RowColumnInfo
 * @property {string} face
 * @property {number} [row]
 * @property {string} [rows]
 * @property {number} [column]
 * @property {string} [columns]
 */

/**
 * @typedef Cell
 * @property {number} x
 * @property {number} y
 * @property {string} face
 */

/**
 * @typedef Cell1
 * @property {number} row
 * @property {number} column
 * @property {string} face
 */
