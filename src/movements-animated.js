import { cloneCube } from './cube-utils/clone-cube';
import * as CubeTypes from './cube-utils/identifier-cube';
import { transformFace } from './cube-utils/rotate-face';

/**
 * @param {CubeTypes.Cube} cube
 * @param {number} movement
 * @param {Cell[]} edges
 */
const moveEdges = (cube, movement, edges) => {
	const srcCube = cloneCube(cube);

	for (let i = 0; i < 12; ++i) {
		const src = edges[i];
		const dest = edges[i + movement];
		cube[dest.faceName][dest.row][dest.col] = srcCube[src.faceName][src.row][src.col];
	}
};

/**
 * @param {string} faceName
 * @param {number} col
 * @return {Cell[]}
 */
const columnDown = (faceName, col) => [0, 1, 2].map(row => ({ faceName, row, col }));

/**
 * @param {string} faceName
 * @param {number} col
 * @return {Cell[]}
 */
const columnUp = (faceName, col) => [2, 1, 0].map(row => ({ faceName, row, col }));

/**
 * @param {string} faceName
 * @param {number} row
 * @return {Cell[]}
 */
const rowLeft = (faceName, row) => [2, 1, 0].map(col => ({ faceName, row, col }));

/**
 * @param {string} faceName
 * @param {number} row
 * @return {Cell[]}
 */
const rowRight = (faceName, row) => [0, 1, 2].map(col => ({ faceName, row, col }));

const rootDefinitions = [
	'U: rotate U | L row 0 left  | B row 0 left  | R row 0 left  | F row 0 left',
	'D: rotate D | L row 2 right | F row 2 right | R row 2 right | B row 2 right',
	'L: rotate L | U col 0 down  | F col 0 down  | D col 0 down  | B col 2 up',
	'R: rotate R | B col 0 down  | D col 2 up    | F col 2 up    | U col 2 up',
	'F: rotate F | R col 0 down  | D row 0 left  | L col 2 up    | U row 2 right',
	'B: rotate B | L col 0 down  | D row 2 right | R col 2 up    | U row 0 left',

	// M - middle (parallel to R) down (mid col)
	// E - middle (parallel to U) right (mid row)
	// S - middle (parallel to F) right (mid plane)
	'M:            U col 1 down  | F col 1 down  | D col 1 down  | B col 1 up',
	'E:            L row 1 right | F row 1 right | R row 1 right | B row 1 right',
	'S:            R col 1 down  | D row 1 left  | L col 1 up    | U row 1 right',
];
const definitionsMixed = [
	'u: U E_',
	'd: D E',
	'l: L M',
	'r: R M_',
	'f: F S',
	'b: B S_',

	// x - up (like R), y - left (life U), z - rotate cube like F
	'x: r L_',
	'y: u D_',
	'z: f B_',
];

/**
 * @param {string[]} _definitions
 * @return {Definition[]}
 */
const convertStringToObjectDefinitions = _definitions => _definitions.map(defS => {
	const name = defS.split(':')[0];

	/** @type {Definition} */
	const def = { name, rotations: [], edges: [] };

	const parts = defS.split(':')[1].split('|').map(s => s.trim());
	const rotationPart = parts.length === 4 ? undefined : parts.shift();
	if (parts.length !== 4)
		throw new Error('There should be 4 edges: ' + defS);

	if (rotationPart) {
		const ss = rotationPart.split(' ');
		const faceName = ss[1];
		def.rotations.push({ clockwise: true, faceName });
	}

	/** @type {Array<Array<Cell>>} */
	const edges = parts.map(part => {
		const ss = part.split(' ');

		// e.g. 'U col 1 down'
		const faceName = ss[0];
		const area = ss[1];
		const areaIndex = +ss[2];
		const dir = ss[3];
		const areaDir = area + '-' + dir;

		switch (areaDir) {
			case 'col-down': return columnDown(faceName, areaIndex);
			case 'col-up': return columnUp(faceName, areaIndex);
			case 'row-left': return rowLeft(faceName, areaIndex);
			case 'row-right': return rowRight(faceName, areaIndex);
			default: throw new Error('Invalid area & dir: ' + areaDir);
		}
	});

	const allEdges = [...edges[0], ...edges[1], ...edges[2], ...edges[3], ...edges[0]];
	def.edges.push(allEdges);

	return def;
});

/**
 * @param {Definition[]} _definitions
 * @return {Definition[]}
 */
const createMissingReverses = _definitions => _definitions
	.filter(def => !def.name.endsWith('_') && !_definitions[def.name + '_'])
	.map(def => {
		/** @type {Definition} */
		return {
			name: def.name + '_',
			rotations: def.rotations.map(rot => ({
				clockwise: !rot.clockwise,
				faceName: rot.faceName,
			})),
			edges: def.edges.map(edge => edge.slice().reverse()),
		};
	});

/**
 * @param {string[]} _mixedDefinitions
 * @param {Definition[]} _allDefinitions
 * @return {Definition[]}
 */
const expandMixedDefinitions = (_mixedDefinitions, _allDefinitions) => {
	/** @type {Definition[]} */
	const newDefinitions = [];

	for (const defS of _mixedDefinitions) {
		const name = defS.split(':')[0];

		const parts = defS.split(':')[1].trim().split(' ').map(s => s.trim());
		if (parts.length !== 2)
			throw new Error('There should be 2 parts: ' + defS);

		const findIn = [..._allDefinitions, ...newDefinitions];
		const def1 = findIn.find(x => x.name === parts[0]);
		if (!def1) throw new Error('Did not find def1 for name: ' + parts[0]);

		const def2 = findIn.find(x => x.name === parts[1]);
		if (!def2) throw new Error('Did not find def2 for name: ' + parts[1]);

		/** @type {Definition} */
		const item = {
			name,
			rotations: [...def1.rotations, ...def2.rotations],
			edges: [...def1.edges, ...def2.edges],
		};
		newDefinitions.push(item);
	}

	return newDefinitions;
};

const ROTATION_RIGHT = [
	[
		// middle
		'10 00 01',
		'20 11 02',
		'21 22 12',
	],
	[
		// final
		'20 10 00',
		'21 11 01',
		'22 12 02',
	]
];

const ROTATION_LEFT = [
	[
		// middle
		'01 02 12',
		'00 11 22',
		'10 20 21',
	],
	[
		// final
		'02 12 22',
		'01 11 21',
		'00 10 20',
	]
];

const getMovementsAnimated = () => {
	const movementsAnimated = {};
	for (const def of allDefinitions) {

		/**
		 * @param {CubeTypes.Cube} cube
		 * @return {CubeTypes.Cube[]}
		 */
		movementsAnimated[def.name] = cube => {
			const items = [];
			items[0] = cube;

			// there are 2 steps for rotation and 3 steps for shifting:
			// step 0 - src
			// step 1 - shift
			// step 2 - rotate
			// step 3 - shift
			// step 4 - rotate
			// step 5 - move - final
			for (let step = 1; step <= 5; ++step) {
				const cube1 = cloneCube(cube);
				items[step] = cube1;

				if (step >= 2) {
					// rotate
					for (const rotation of def.rotations) {
						// step === 2,3,4,5  convert to index 0,0,1,1
						const index = Math.floor(step / 2) - 1;
						const ROT = rotation.clockwise ? ROTATION_RIGHT : ROTATION_LEFT;
						cube1[rotation.faceName] = transformFace(cube1[rotation.faceName], ROT[index]);
					}
				}

				if (step >= 1) {
					// shift
					// step === 1,2, 3,4 5  convert to movement 1,1 2,2 3
					const movement = Math.floor((step + 1) / 2);
					for (const edge of def.edges)
						moveEdges(cube1, movement, edge);
				}
			}
			return items;
		};
	}
	return movementsAnimated;
};


const allDefinitions = [];
allDefinitions.push(...convertStringToObjectDefinitions(rootDefinitions));
allDefinitions.push(...createMissingReverses(allDefinitions));
allDefinitions.push(...expandMixedDefinitions(definitionsMixed, allDefinitions));
allDefinitions.push(...createMissingReverses(allDefinitions));

// movementsAnimated[movementName](cube)[0..5]
export const movementsAnimated = getMovementsAnimated();


/**
 * @typedef Definition
 * @property {string} name
 * @property {DefinitionRotation[]} rotations
 * @property {DefinitionJoinedEdge[]} edges
 */
/**
 * @typedef DefinitionRotation
 * @property {boolean} clockwise
 * @property {string} faceName
 */
/**
 * @typedef DefinitionJoinedEdge
 * @type {Cell[]}
 */

/**
 * @typedef Cell
 * @property {string} faceName
 * @property {number} row
 * @property {number} col
 */
