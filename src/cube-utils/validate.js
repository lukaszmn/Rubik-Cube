import * as CubeTypes from './identifier-cube';

/**
 * @param {CubeTypes.Cube} cube
 * @return {ValidateRes}
 */
export const validate = cube => {
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
		if (key !== '-' && counts[key] > 9)
			return { valid: false, counts };
	}
	return { valid: true, counts };
};

/**
 * @typedef ValidateRes
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
