import { createSide } from './cube-utils/create-side';

export const readCube = arr => {
	const cube = {
		U: createSide(),
		L: createSide(),
		F: createSide(),
		R: createSide(),
		B: createSide(),
		D: createSide(),
	};

	const top = arr[1].trim().split(' ');
	cube.U = [
		[ top[7], top[6], top[5] ],
		[ top[0], arr[0], top[4] ],
		[ top[1], top[2], top[3] ],
	];

	const bot = arr[5].trim().split(' ');
	cube.D = [
		[ bot[1], bot[2], bot[3] ],
		[ bot[0], arr[6], bot[4] ],
		[ bot[7], bot[6], bot[5] ],
	];

	const readSide = index => {
		const face = [
			arr[2].split(' ')[index],
			arr[3].split(' ')[index],
			arr[4].split(' ')[index],
		];
		return face.map(s => Array.from(s));
	};

	cube.L = readSide(0);
	cube.F = readSide(1);
	cube.R = readSide(2);
	cube.B = readSide(3);

	return cube;
};
