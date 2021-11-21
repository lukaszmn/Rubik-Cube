export const paintCube = (cube, faceName, cx, cy, direction, color) => {

	const face = cube[faceName];
	--cx;
	--cy;

	switch (direction) {

		case REPEAT_KEY_DIRECTION.cell:
			face[cy][cx] = color;
			break;

		case REPEAT_KEY_DIRECTION.face:
			for (cx = 0; cx < 3; ++cx) {
				for (cy = 0; cy < 3; ++cy)
					face[cy][cx] = color;
			}
			break;

		case REPEAT_KEY_DIRECTION.rowFace:
			for (cx = 0; cx < 3; ++cx)
				face[cy][cx] = color;
			break;

		case REPEAT_KEY_DIRECTION.columnFace:
			for (cy = 0; cy < 3; ++cy)
				face[cy][cx] = color;
			break;

		case REPEAT_KEY_DIRECTION.rowAll:
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
			const rowInfo = rowMap[faceName](cy);
			// console.log({x: 'rowAll', faceName, cx, cy, rowInfo});
			const cells1 = getCells(rowInfo);
			for (const cell of cells1)
				cube[cell.face][cell.row][cell.column] = color;
			break;

		case REPEAT_KEY_DIRECTION.columnAll:
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
			const columnInfo = columnMap[faceName](cx);
			// console.log({x: 'columnAll', faceName, cx, cy, columnInfo});
			const cells2 = getCells(columnInfo);
			for (const cell of cells2)
				cube[cell.face][cell.row][cell.column] = color;
			break;

	}
};

export const REPEAT_KEY_DIRECTION = {
	cell: 1,
	face: 2,
	rowFace: 3,
	rowAll: 4,
	columnFace: 5,
	columnAll: 6,
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
