import { toCube, toOneLine } from '../src/cube-converters';
import { getIdentifierCube } from '../src/identifier-cube';
import { movements } from '../src/movements';

/* eslint camelcase: "off" */

console.log('Testing movements');

const test_checkMovements_data = () => {
	const expected = [
		'0  012345678 9ABCDEFGH IJKLMNOPQ RSTUVWXYZ abcdefghi jklmnopqr',
		'B  TWZ345678 2AB1DE0GH IJKLMNOPQ RSrUVqXYp gdahebifc jklmno9CF',
		'B_ FC9345678 pABqDErGH IJKLMNOPQ RS0UV1XY2 cfibehadg jklmnoZWT',
		'D  012345678 9ABCDEghi IJKLMNFGH RSTUVWOPQ abcdefXYZ pmjqnkrol',
		'D_ 012345678 9ABCDEOPQ IJKLMNXYZ RSTUVWghi abcdefFGH lorknqjmp',
		'E  012345678 9ABdefFGH IJKCDEOPQ RSTLMNXYZ abcUVWghi jklmnopqr',
		'E_ 012345678 9ABLMNFGH IJKUVWOPQ RSTdefXYZ abcCDEghi jklmnopqr',
		'F  012345HEB 9AjCDkFGl OLIPMJQNK 6ST7VW8YZ abcdefghi XURmnopqr',
		'F_ 012345RUX 9A8CD7FG6 KNQJMPILO lSTkVWjYZ abcdefghi BEHmnopqr',
		'L  i12f45c78 FC9GDAHEB 0JK3MN6PQ RSTUVWXYZ abpdemghj IklLnoOqr',
		'L_ I12L45O78 BEHADG9CF jJKmMNpPQ RSTUVWXYZ ab6de3gh0 iklfnocqr',
		'M  0h23e56b8 9ABCDEFGH I1KL4NO7Q RSTUVWXYZ aqcdnfgki jJlmMopPr',
		'M_ 0J23M56P8 9ABCDEFGH IkKLnNOqQ RSTUVWXYZ a7cd4fg1i jhlmeopbr',
		'R  01K34N67Q 9ABCDEFGH IJlLMoOPr XURYVSZWT 8bc5ef2hi jkgmndpqa',
		'R_ 01g34d67a 9ABCDEFGH IJ2LM5OP8 TWZSVYRUX rbcoeflhi jkKmnNpqQ',
		'S  012GDA678 9mBCnEFoH IJKLMNOPQ R3TU4WX5Z abcdefghi jklYVSpqr',
		'S_ 012SVY678 95BC4EF3H IJKLMNOPQ RoTUnWXmZ abcdefghi jklADGpqr',
		'U  630741852 IJKCDEFGH RSTLMNOPQ abcUVWXYZ 9ABdefghi jklmnopqr',
		'U_ 258147036 abcCDEFGH 9ABLMNOPQ IJKUVWXYZ RSTdefghi jklmnopqr',
		'b  TWZSVY678 25B14E03H IJKLMNOPQ RorUnqXmp gdahebifc jklADG9CF',
		'b_ FC9GDA678 pmBqnEroH IJKLMNOPQ R30U41X52 cfibehadg jklYVSZWT',
		'd  012345678 9ABdefghi IJKCDEFGH RSTLMNOPQ abcUVWXYZ pmjqnkrol',
		'd_ 012345678 9ABLMNOPQ IJKUVWXYZ RSTdefghi abcCDEFGH lorknqjmp',
		'f  012GDAHEB 9mjCnkFol OLIPMJQNK 63T74W85Z abcdefghi XURYVSpqr',
		'f_ 012SVYRUX 958C47F36 KNQJMPILO loTknWjmZ abcdefghi BEHADGpqr',
		'l  ih2fe5cb8 FC9GDAHEB 01K34N67Q RSTUVWXYZ aqpdnmgkj IJlLMoOPr',
		'l_ IJ2LM5OP8 BEHADG9CF jkKmnNpqQ RSTUVWXYZ a76d43g10 ihlfeocbr',
		'r  0JK3MN6PQ 9ABCDEFGH IklLnoOqr XURYVSZWT 87c54f21i jhgmedpba',
		'r_ 0hg3ed6ba 9ABCDEFGH I12L45O78 TWZSVYRUX rqconflki jJKmMNpPQ',
		'u  630741852 IJKLMNFGH RSTUVWOPQ abcdefXYZ 9ABCDEghi jklmnopqr',
		'u_ 258147036 abcdefFGH 9ABCDEOPQ IJKLMNXYZ RSTUVWghi jklmnopqr',
		'x  IJKLMNOPQ BEHADG9CF jklmnopqr XURYVSZWT 876543210 ihgfedcba',
		'x_ ihgfedcba FC9GDAHEB 012345678 TWZSVYRUX rqponmlkj IJKLMNOPQ',
		'y  630741852 IJKLMNOPQ RSTUVWXYZ abcdefghi 9ABCDEFGH lorknqjmp',
		'y_ 258147036 abcdefghi 9ABCDEFGH IJKLMNOPQ RSTUVWXYZ pmjqnkrol',
		'z  FC9GDAHEB pmjqnkrol OLIPMJQNK 630741852 cfibehadg XURYVSZWT',
		'z_ TWZSVYRUX 258147036 KNQJMPILO lorknqjmp gdahebifc BEHADG9CF',
	];

	const actual = [
		'0  ' + toOneLine(getIdentifierCube(), true),
	];

	for (const name of Object.getOwnPropertyNames(movements).sort()) {
		const mov = movements[name];
		const next = getIdentifierCube();
		mov(next);

		const line = (name + '  ').substr(0, 3) + toOneLine(next, true);
		actual.push(line);
	}

	for (let i = 0; i < Math.max(expected.length, actual.length); ++i) {
		const expectedLine = expected[i];
		const actualLine = actual[i];
		if (expectedLine !== actualLine)
			throw new Error(`Rows are different:\n${actualLine}\nbut expected:\n${expectedLine}`);
	}
};

const test_checkMovements_constraints = () => {
	for (const name of Object.getOwnPropertyNames(movements)) {
		const mov = movements[name];
		const prev = getIdentifierCube();
		const next = getIdentifierCube();
		mov(next);
		verifyConstraints(name, prev, next);
	}
};

const verifyConstraints = (movementName, prev, next) => {
	const getCells = cube => [...getEdges(cube), ...getCorners(cube)]
		.map(x => x.sort().join(''))
		.sort();

	const prevCells = getCells(prev);
	const nextCells = getCells(next);

	const remainingCells = nextCells.filter(x => !prevCells.includes(x));

	if (remainingCells.length !== 0)
		throw new Error(
			`Previous and next cubes for movement ${movementName} are not equal - at least ${remainingCells.length} cells different`
		);
};

const marked = toCube('1A2D-B4C3 1D4E-F5G6 4C3F-H6J7 3B2H-I7K8 2A1I-E8L5 6J7G-K5L8');

const getEdges = cube => Array.from('ABCDEFGHIJKL').map(
	s => getCubeLocations(s).map(
		locations => cube[locations[0]][locations[1]][locations[2]]
	)
);

const getCorners = cube => Array.from('12345678').map(
	s => getCubeLocations(s).map(
		locations => cube[locations[0]][locations[1]][locations[2]]
	)
);

const getCubeLocations = name => {

	const forFace = faceName => marked[faceName]
		.map(forRow(faceName))
		.filter(x => x.length > 0);

	const forRow = faceName => (row, rowIndex) => row.map(forCell(faceName, rowIndex))
		.filter(x => x !== null);

	const forCell = (faceName, rowIndex) => (cell, cellIndex) => cell === name ? [faceName, rowIndex, cellIndex] : null;

	return Array.from('BDFLRU').map(forFace)
		.filter(x => x.length > 0)
		.reduce((prev, curr) => [...prev, ...curr])
		.reduce((prev, curr) => [...prev, ...curr])
	;
};

const test_checkLocations_12_edges = () => {
	const edges = getEdges(getIdentifierCube());
	if (edges.length !== 12)
		throw new Error();
};

const test_checkLocations_8_corners = () => {
	const corners = getCorners(getIdentifierCube());
	if (corners.length !== 8)
		throw new Error();
};

const test_checkLocations_edge_has_2_cells = () => {
	const edges = getEdges(getIdentifierCube());
	for (const edge of edges) {
		if (edge.length !== 2)
			throw new Error();
	}
};

const test_checkLocations_corner_has_3_cells = () => {
	const corners = getCorners(getIdentifierCube());
	for (const corner of corners) {
		if (corner.length !== 3)
			throw new Error();
	}
};

const test_checkLocations_48_cells = () => {
	const edges = getEdges(getIdentifierCube());
	const corners = getCorners(getIdentifierCube());
	const locations = [...edges, ...corners]
		.reduce((prev, curr) => [...prev, ...curr]);
	if (locations.length !== 6 * 8)
		throw new Error('Expected 48 cells, found ' + locations.length);
};

const test_checkLocations_no_duplicates = () => {
	const edges = getEdges(getIdentifierCube());
	const corners = getCorners(getIdentifierCube());
	const locations = [...edges, ...corners]
		.reduce((prev, curr) => [...prev, ...curr]);
	const unique = [...new Set(locations)];
	if (unique.length !== locations.length)
		throw new Error(`Expected ${locations.length} unique cells, found ${unique.length}`);
};

test_checkLocations_12_edges();
test_checkLocations_8_corners();
test_checkLocations_edge_has_2_cells();
test_checkLocations_corner_has_3_cells();
test_checkLocations_48_cells();
test_checkLocations_no_duplicates();

test_checkMovements_constraints();
test_checkMovements_data();

console.log('-> OK');
