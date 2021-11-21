import { STATE } from './state';

// https://github.com/dariuszp/colog/blob/master/src/colog.js

export const colors = {
	Y: '\x1B[93mQ\x1B[37m',
	B: '\x1B[38;5;39mQ\x1B[37m',
	R: '\x1B[91mQ\x1B[37m',
	G: '\x1B[92mQ\x1B[37m',
	O: '\x1B[38;5;214mQ\x1B[37m',
	W: '\x1B[97mQ\x1B[37m',
};

export const highlight = '\x1B[46mQ\x1B[49m';

export const clearScreen = () => {
	// https://en.wikipedia.org/wiki/ANSI_escape_code#CSI_(Control_Sequence_Introducer)_sequences
	const clearScreen_ = '\x1B[2J';
	console.log(clearScreen_);
	STATE.needsClearScreen = false;
};

export const logAndClearLine = s => {
	const width = process.stdout.columns - 1;
	const spaces = ' '.repeat(width);
	s = (s + spaces).slice(0, width);
	console.log(s);
};

export const clear = msg => {
	if (STATE.needsClearScreen)
		clearScreen();

	// https://en.wikipedia.org/wiki/ANSI_escape_code#CSI_(Control_Sequence_Introducer)_sequences
	const move100LinesUp = '\x1B[91' + '10' + 'A';
	console.log(move100LinesUp);
	msg = msg ?? 'F1 - help';
	logAndClearLine(msg);
};
