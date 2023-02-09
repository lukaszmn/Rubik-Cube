export const getIdentifierCube = () => {

	let i = 0;

	const makeFace = () => [ makeRow(), makeRow(), makeRow() ];

	const makeRow = () => [getChar(i++), getChar(i++), getChar(i++)];

	const getChar = i => '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'[i];

	return {
		U: makeFace(),
		L: makeFace(),
		F: makeFace(),
		R: makeFace(),
		B: makeFace(),
		D: makeFace(),
	};
};
