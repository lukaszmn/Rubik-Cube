export const toOneLine = (cube, withSpaces) => [cube.U, cube.L, cube.F, cube.R, cube.B, cube.D]
	.reduce((prev, curr) => [...prev, withSpaces ? ' ' : '', ...curr])
	.reduce((prev, curr) => [...prev, ...curr])
	.join('');

export const toCube = oneLine => {
	const getRow = (face, index) => Array.from(face.substr(index * 3, 3));
	const getFace = (line, index) => {
		const face = line.substr(index * 9, 9);
		return [ getRow(face, 0), getRow(face, 1), getRow(face, 2) ];
	};

	oneLine = oneLine.replace(/ /g, '');
	return {
		U: getFace(oneLine, 0),
		L: getFace(oneLine, 1),
		F: getFace(oneLine, 2),
		R: getFace(oneLine, 3),
		B: getFace(oneLine, 4),
		D: getFace(oneLine, 5),
	};
};
