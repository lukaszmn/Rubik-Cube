import * as CubeTypes from './identifier-cube';

const IGNORE_COLOR = '-';

/**
 * @param {CubeTypes.Cube} cube
 * @return {ValidateRes}
 */
export const validate = cube => {
	const colorsSum = getColorCounts(cube);
	const permutations = getPermutationCounts(cube);

	return { colorsSum, permutations };
};

/**
 * @param {CubeTypes.Cube} cube
 * @return {ValidateResColorsSum}
 */
const getColorCounts = cube => {
	const counts = {
		'W': 0,
		'R': 0,
		'G': 0,
		'B': 0,
		'O': 0,
		'Y': 0,
		'-': 0,
	};

	for (const face in cube) {
		for (const row of cube[face]) {
			for (const cell of row)
				++counts[cell];
		}
	}

	for (const key in counts) {
		if (key !== IGNORE_COLOR && counts[key] > 9)
			return { valid: false, counts };
	}

	return { valid: true, counts };
};

/**
 * @param {CubeTypes.Cube} cube
 * @return {ValidateResPermutations}
 */
const getPermutationCounts = cube => {

	/* documentation:
		https://math.stackexchange.com/questions/127577/how-to-tell-if-a-rubiks-cube-is-solvable
		https://ruwix.com/the-rubiks-cube/unsolvable-rubiks-cube-invalid-scramble/
		https://www.quora.com/Is-it-possible-to-determine-whether-a-Rubiks-Cube-is-solvable-just-by-looking-at-its-scrambled-state?share=1
		http://www.math.rwth-aachen.de/~Martin.Schoenert/Cube-Lovers/David_Vanderschel__Orbit_Classification.html
	*/

	/** @type {FaceColors} */
	const faceColors = {
		F: cube.F[1][1],
		B: cube.B[1][1],
		R: cube.R[1][1],
		L: cube.L[1][1],
		U: cube.U[1][1],
		D: cube.D[1][1],
	};

	/** @type {OppositeColors} */
	const oppositeColors = { 'W': '', 'R': '', 'G': '', 'B': '', 'O': '', 'Y': '', '-': '+' };
	oppositeColors[faceColors.F] = faceColors.B;
	oppositeColors[faceColors.B] = faceColors.F;
	oppositeColors[faceColors.R] = faceColors.L;
	oppositeColors[faceColors.L] = faceColors.R;
	oppositeColors[faceColors.U] = faceColors.D;
	oppositeColors[faceColors.D] = faceColors.U;

	/**
	 * @param {string} def - e.g. L21
	 * @return {string} cell color
	 */
	const getCell = def => {
		const faceName = def[0];
		const row = +def[1];
		const col = +def[2];
		return cube[faceName][row][col];
	};

	/** @type {Corner[]} */
	const corners = [
		'U00 L00 B02', // first up/down, then clockwise rotation, then counter-clockwise rotation
		'U02 B00 R02',
		'U22 R00 F02',
		'U20 F00 L02',
		'D00 L22 F20',
		'D02 F22 R20',
		'D22 R22 B20',
		'D20 B22 L20'
	].map(corner => {
		const items = corner.split(' ');
		return {
			a: getCell(items[0]),
			b: getCell(items[1]),
			c: getCell(items[2]),
			aFaceColor: faceColors[items[0][0]],
			bFaceColor: faceColors[items[1][0]],
			cFaceColor: faceColors[items[2][0]],
		};
	});

	/** @type {Edge[]} */
	const edges = [
		'U01 B01',
		'U12 R01',
		'U21 F01',
		'U10 L01',
		'D01 F21',
		'D12 R21',
		'D21 B21',
		'D10 L21',
		'F12 R10',
		'R12 B10',
		'B12 L10',
		'L12 F10'
	].map(edge => {
		const items = edge.split(' ');
		return {
			a: getCell(items[0]),
			b: getCell(items[1]),
			aFaceColor: faceColors[items[0][0]],
			bFaceColor: faceColors[items[1][0]],
		};
	});

	const countCorners = getCornerRotations(faceColors, corners);
	const countEdges = getEdgeSwaps(oppositeColors, edges);
	const countParity = getPermutationsParity(corners, edges);
	const illegalColors = getIllegalColors(oppositeColors, corners, edges);
	const duplicatedCenters = getDuplicatedCenters(faceColors);

	/** @type {ValidatePermutations} */
	const res = {
		corners: countCorners,
		edges: countEdges,
		parity: countParity,
		illegalColors: illegalColors,
		duplicatedCenters: duplicatedCenters,
	};

	const valid = res.corners === 0 && res.edges === 0 && res.parity && res.illegalColors === undefined && !duplicatedCenters;
	return { valid, info: res };
};

/**
 * @param {FaceColors} faceColors
 * @param {Corner[]} corners
 * @return {number}
 */
const getCornerRotations = (faceColors, corners) => {
	let count = 0;
	for (const corner of corners) {
		// clockwise rotation => add 1
		if (corner.b === faceColors.U || corner.b === faceColors.D)
			++count;
		// counter-clockwise rotation => add 2
		else if (corner.c === faceColors.U || corner.c === faceColors.D)
			count += 2;
		// no rotation => add 0
	}
	return count % 3;
};

/**
 * @param {OppositeColors} oppositeColors
 * @param {Edge[]} edges
 * @return {number}
 */
const getEdgeSwaps = (oppositeColors, edges) => {
	let count = 0;
	for (const edge of edges) {
		// if first color of an edge is the same as its face color
		// or is the same as the color on the opposite face
		// then it's oriented correctly. Otherwise not => add 1
		if (
			edge.a !== IGNORE_COLOR && edge.a !== edge.aFaceColor && edge.a !== oppositeColors[edge.aFaceColor] &&
			edge.b !== IGNORE_COLOR && edge.b !== edge.bFaceColor && edge.b !== oppositeColors[edge.bFaceColor]
		)
			++count;
	}
	return count % 2;
};

/**
 * @param {Corner[]} corners
 * @param {Edge[]} edges
 * @return {boolean}
 */
const getPermutationsParity = (corners, edges) => {
	let countCorners = 0;
	for (const corner of corners) {
		if (corner.a !== IGNORE_COLOR && corner.a !== corner.aFaceColor)
			++countCorners;
		if (corner.b !== IGNORE_COLOR && corner.b !== corner.bFaceColor)
			++countCorners;
		if (corner.c !== IGNORE_COLOR && corner.c !== corner.cFaceColor)
			++countCorners;
	}

	let countEdges = 0;
	for (const edge of edges) {
		if (edge.a !== IGNORE_COLOR && edge.a !== edge.aFaceColor)
			++countEdges;
		if (edge.b !== IGNORE_COLOR && edge.b !== edge.bFaceColor)
			++countEdges;
	}
	return countCorners % 2 === countEdges % 2;
};

/**
 * @param {OppositeColors} oppositeColors
 * @param {Corner[]} corners
 * @param {Edge[]} edges
 * @return {string | undefined}
 */
const getIllegalColors = (oppositeColors, corners, edges) => {
	for (const corner of corners) {
		if (corner.a === oppositeColors[corner.b] ||
			corner.a === oppositeColors[corner.c] ||
			corner.b === oppositeColors[corner.c]
		)
			return `Corner ${corner.a}-${corner.b}-${corner.c}`;
	}

	for (const edge of edges) {
		if (edge.a === oppositeColors[edge.b])
			return `Edge ${edge.a}-${edge.b}`;
	}

	return undefined;
};

/**
 * @param {FaceColors} faceColors
 * @return {boolean}
 */
const getDuplicatedCenters = faceColors => {
	const centers = [faceColors.B, faceColors.D, faceColors.F, faceColors.L, faceColors.R, faceColors.U].sort().join('');
	return (
		centers.includes('RR') || centers.includes('GG') || centers.includes('BB') ||
		centers.includes('OO') || centers.includes('WW') || centers.includes('YY')
	);
};

/**
 * @typedef Corner
 * @property {string} a;
 * @property {string} b;
 * @property {string} c;
 * @property {string} aFaceColor;
 * @property {string} bFaceColor;
 * @property {string} cFaceColor;
 */

/**
 * @typedef Edge
 * @property {string} a;
 * @property {string} b;
 * @property {string} aFaceColor;
 * @property {string} bFaceColor;
 */

/**
 * @typedef FaceColors
 * @property {string} F;
 * @property {string} B;
 * @property {string} R;
 * @property {string} L;
 * @property {string} U;
 * @property {string} D;
 */

/**
 * @typedef OppositeColors
 * @property {string} W;
 * @property {string} R;
 * @property {string} G;
 * @property {string} B;
 * @property {string} O;
 * @property {string} Y;
 * //@property {string} "-"
 */

/**
 * @typedef ValidateRes
 * @property {ValidateResColorsSum} colorsSum;
 * @property {ValidateResPermutations} permutations;
 */

/**
 * @typedef ValidateResColorsSum
 * @property {boolean} valid
 * @property {ValidateCounts} counts
 */
/**
 * @typedef ValidateCounts
 * @property {number} W
 * @property {number} R
 * @property {number} G
 * @property {number} B
 * @property {number} O
 * @property {number} Y
 * //@property {number} "-"
 */

/**
 * @typedef ValidateResPermutations
 * @property {boolean} valid
 * @property {ValidatePermutations} info
 */
/**
 * @typedef ValidatePermutations
 * @property {number} corners
 * @property {number} edges
 * @property {boolean} parity
 * @property {string | undefined} illegalColors
 * @property {boolean} duplicatedCenters
 */
