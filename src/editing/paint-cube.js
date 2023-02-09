export const paintCube = (cube, faceName, cx02, cy02, direction, color) => {
	const cells = getCellsInDirection(faceName, cx02, cy02, direction);
	for (const cell of cells)
		cube[cell.face][cell.y][cell.x] = color;
};

export const getCellsInDirection = (faceName, cx02, cy02, direction) => {

	const cells = [];
	const addCell = (x, y, face) => cells.push({ x, y, face: face || faceName });

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

export const REPEAT_KEY_DIRECTION = {
	cell: 1,
	face: 2,
	rowFace: 3,
	rowAll: 4,
	columnFace: 5,
	columnAll: 6,
};

const getRowInfo = (faceName, cy02) => {
	const rowMap = {
		U: row => [
			{ face: 'U', row: row, columns: '012' },
			{ face: 'R', rows: '012', column: 2 - row },
			{ face: 'D', row: 2 - row, columns: '210' },
			{ face: 'L', rows: '210', column: row },
		],
		D: row => [
			{ face: 'D', row: row, columns: '210' },
			{ face: 'L', rows: '210', column: 2 - row },
			{ face: 'U', row: 2 - row, columns: '012' },
			{ face: 'R', rows: '012', column: row },
		],
		L: row => [
			{ face: 'L', row: row, columns: '012' },
			{ face: 'F', row: row, columns: '012' },
			{ face: 'R', row: row, columns: '012' },
			{ face: 'B', row: row, columns: '012' },
		],
		F: row => [
			{ face: 'F', row: row, columns: '012' },
			{ face: 'R', row: row, columns: '012' },
			{ face: 'B', row: row, columns: '012' },
			{ face: 'L', row: row, columns: '012' },
		],
		R: row => [
			{ face: 'R', row: row, columns: '012' },
			{ face: 'B', row: row, columns: '012' },
			{ face: 'L', row: row, columns: '012' },
			{ face: 'F', row: row, columns: '012' },
		],
		B: row => [
			{ face: 'B', row: row, columns: '012' },
			{ face: 'L', row: row, columns: '012' },
			{ face: 'F', row: row, columns: '012' },
			{ face: 'R', row: row, columns: '012' },
		],
	};
	return rowMap[faceName](cy02);
};

const getColumnInfo = (faceName, cx02) => {
	const columnMap = {
		U: column => [
			{ face: 'U', rows: '012', column: column },
			{ face: 'F', rows: '012', column: column },
			{ face: 'D', rows: '012', column: column },
			{ face: 'B', rows: '210', column: 2 - column },
		],
		F: column => [
			{ face: 'F', rows: '012', column: column },
			{ face: 'D', rows: '012', column: column },
			{ face: 'B', rows: '210', column: 2 - column },
			{ face: 'U', rows: '012', column: column },
		],
		D: column => [
			{ face: 'D', rows: '012', column: column },
			{ face: 'B', rows: '210', column: 2 - column },
			{ face: 'U', rows: '012', column: column },
			{ face: 'F', rows: '012', column: column },
		],
		B: column => [
			{ face: 'B', rows: '210', column: column },
			{ face: 'U', rows: '012', column: 2 - column },
			{ face: 'F', rows: '012', column: 2 - column },
			{ face: 'D', rows: '012', column: 2 - column },
		],
		L: column => [
			{ face: 'L', rows: '210', column: column },
			{ face: 'U', row: column, columns: '012' },
			{ face: 'R', rows: '012', column: 2 - column },
			{ face: 'D', row: 2 - column, columns: '210' },
		],
		R: column => [
			{ face: 'R', rows: '012', column: column },
			{ face: 'D', row: column, columns: '210' },
			{ face: 'L', rows: '210', column: 2 - column },
			{ face: 'U', row: 2 - column, columns: '012' },
		],
	};
	return columnMap[faceName](cx02);
};

const getCells = facesInfo => {
	const cells = [];

	for (const faceInfo of facesInfo) {
		if (faceInfo.row != undefined && faceInfo.rows != undefined)
			throw new Error('Both row & rows defined');
		if (faceInfo.column != undefined && faceInfo.columns != undefined)
			throw new Error('Both column & columns defined');
		if (faceInfo.rows != undefined && faceInfo.columns != undefined)
			throw new Error('Both rows & columns defined');

		if (faceInfo.row !== undefined) {
			for (const col of Array.from(faceInfo.columns))
				cells.push({ face: faceInfo.face, row: faceInfo.row, column: +col });
		}
		if (faceInfo.column != undefined) {
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
