/** @typedef Cube
 *  @property {Face} U
 *  @property {Face} L
 *  @property {Face} F
 *  @property {Face} R
 *  @property {Face} B
 *  @property {Face} D
 */
/** @typedef Face
 *  @type {Row[]}
 */
/** @typedef Row
 *  @type {Cell[]}
 */
/** @typedef Cell
 *  @type {string}
 */

/** @return {Cube} */
export const getIdentifierCube = () => {

	let i = 0;

	/** @return {Face} */
	const makeFace = () => [ makeRow(), makeRow(), makeRow() ];

	/** @return {Row} */
	const makeRow = () => [getChar(i++), getChar(i++), getChar(i++)];

	/**
	 * @param {number} i
	 * @return {string}
	 */
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
