const readTransform = (source, transform) => transform.map(s => s.split(' ')).map(arr => arr.map(x => source[x[0]][x[1]]));

export const rotateFace = face => readTransform(face, [
	'20 10 00',
	'21 11 01',
	'22 12 02',
]);
