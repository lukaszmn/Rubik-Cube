export const convertCursorPositionToFace = (cursorX_1_12, cursorY_1_9) => {
	const result = (faceName, dx, dy) => ({
		faceName,
		cx02: cursorX_1_12 + dx,
		cy02: cursorY_1_9 + dy,
	});

	if (cursorX_1_12 <= 3) { return result('L', -1, -4); }
	else if (cursorX_1_12 <= 6 && cursorY_1_9 <= 3) { return result('U', -4, -1); }
	else if (cursorX_1_12 <= 6 && cursorY_1_9 <= 6) { return result('F', -4, -4); }
	else if (cursorX_1_12 <= 6 && cursorY_1_9 <= 9) { return result('D', -4, -7); }
	else if (cursorX_1_12 <= 9) { return result('R', -7, -4); }
	else if (cursorX_1_12 <= 12) { return result('B', -10, -4); }
	else throw new Error();
};

export const convertCursorPositionFromFace = (face, x02, y02) => {
	const POS = {
		L: [1, 4],
		U: [4, 1],
		F: [4, 4],
		D: [4, 7],
		R: [7, 4],
		B: [10, 4],
	};

	return {
		cursorX_1_12: POS[face][0] + x02,
		cursorY_1_9: POS[face][1] + y02,
	};
};
