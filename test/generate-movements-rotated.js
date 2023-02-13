import { getMovementForRotations } from '../src/feats/movements-rotated';

/* eslint camelcase: "off" */

const test = () => {
	const rotations = ['y'];
	const keys = Array.from('UDLRFBMES');

	let res = '';

	for (const rotation of rotations) {
		// console.log(`Rotation: ${rotation}`);

		for (const key of keys) {
			let found = getMovementForRotations(rotation, key);
			if (found) {
				res += found;
				if (found.includes("'"))
					found = '"' + found + '"';
				else
					found = "'" + found + "'";
				// console.log(`\t${key}: ${found},`);
			} else
				throw new Error(`\t${key} --> NOT FOUND!?`);
		}

		// console.log();
	}

	if (res !== "UDBFLRS'EM")
		throw new Error('Invalid rotated movements: ' + res);

};

console.log('Testing rotations');
test();
console.log('  -> OK');
