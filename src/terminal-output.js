import { STATE } from './state';

// https://github.com/dariuszp/colog/blob/master/src/colog.js
// https://en.wikipedia.org/wiki/ANSI_escape_code#CSI_(Control_Sequence_Introducer)_sequences

const CODE = s => `\x1B[${s}`;
const FONT = s => CODE(s) + 'm';
const FOREGROUND = {
	DEFAULT: FONT(39),
	BRIGHT_RED: FONT(91),
	BRIGHT_GREEN: FONT(92),
	BRIGHT_YELLOW: FONT(93),
	BRIGHT_WHITE: FONT(97),
	RGB: index => FONT('38;5;' + index),
};
const BACKGROUND = {
	DEFAULT: FONT(49),
	CYAN: FONT(46),
	RGB: index => FONT('48;5;' + index),
};
const SCREEN = {
	ERASE: CODE('2J'),
	MOVE_CURSOR_UP: lines => CODE(lines + 'A'),
}

export const colors = {
	Y: FOREGROUND.BRIGHT_YELLOW + 'Q' + FOREGROUND.DEFAULT,
	B: FOREGROUND.RGB(39) + 'Q' + FOREGROUND.DEFAULT,
	R: FOREGROUND.BRIGHT_RED + 'Q' + FOREGROUND.DEFAULT,
	G: FOREGROUND.BRIGHT_GREEN + 'Q' + FOREGROUND.DEFAULT,
	O: FOREGROUND.RGB(214) + 'Q' + FOREGROUND.DEFAULT,
	W: FOREGROUND.BRIGHT_WHITE + 'Q' + FOREGROUND.DEFAULT,
};

export const highlight = BACKGROUND.CYAN + 'Q' + BACKGROUND.DEFAULT;
export const highlight2 = BACKGROUND.RGB(236) + 'Q' + BACKGROUND.DEFAULT;

export const clearScreen = () => {
	console.log(SCREEN.ERASE);
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

	console.log(SCREEN.MOVE_CURSOR_UP(100));
	msg = msg ?? 'F1 - help';
	logAndClearLine(msg);
};
