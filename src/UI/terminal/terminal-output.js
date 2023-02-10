import { STATE } from '../../data/state';

// https://github.com/dariuszp/colog/blob/master/src/colog.js
// https://en.wikipedia.org/wiki/ANSI_escape_code#CSI_(Control_Sequence_Introducer)_sequences

/**
 * @param {number | string} s
 * @return {string}
 */
const CODE = s => `\x1B[${s}`;
/**
 * @param {number | string} s
 * @return {string}
 */
const FONTCODE = s => CODE(s) + 'm';

const FONT = {
	DEFAULT: FONTCODE(0),
	UNDERLINE: FONTCODE(4),
};
const FOREGROUND = {
	DEFAULT: FONTCODE(39),
	BRIGHT_RED: FONTCODE(91),
	BRIGHT_GREEN: FONTCODE(92),
	BRIGHT_YELLOW: FONTCODE(93),
	BRIGHT_WHITE: FONTCODE(97),
	RGB: index => FONTCODE('38;5;' + index),
};
const BACKGROUND = {
	DEFAULT: FONTCODE(49),
	CYAN: FONTCODE(46),
	RGB: index => FONTCODE('48;5;' + index),
};
const SCREEN = {
	ERASE: CODE('2J'),
	MOVE_CURSOR_UP: lines => CODE(lines + 'A'),
};

export const colors = {
	Y: FOREGROUND.BRIGHT_YELLOW + 'Q' + FOREGROUND.DEFAULT,
	B: FOREGROUND.RGB(39) + 'Q' + FOREGROUND.DEFAULT,
	R: FOREGROUND.BRIGHT_RED + 'Q' + FOREGROUND.DEFAULT,
	G: FOREGROUND.BRIGHT_GREEN + 'Q' + FOREGROUND.DEFAULT,
	O: FOREGROUND.RGB(214) + 'Q' + FOREGROUND.DEFAULT,
	W: FOREGROUND.BRIGHT_WHITE + 'Q' + FOREGROUND.DEFAULT,
};

export const highlight = BACKGROUND.CYAN + 'Q' + FONT.DEFAULT;
export const highlight2 = BACKGROUND.RGB(238) + FONT.UNDERLINE + 'Q' + FONT.DEFAULT;
export const highlightMagenta = BACKGROUND.RGB(5) + 'Q' + FONT.DEFAULT;
export const grayBackgrounds = [ BACKGROUND.DEFAULT, BACKGROUND.RGB(234), BACKGROUND.RGB(236) ];

export const clearScreen = () => {
	console.log(SCREEN.ERASE);
	STATE.needsClearScreen = false;
};

/** @param {string} s */
export const logAndClearLine = s => {
	const width = process.stdout.columns - 1;
	const spaces = ' '.repeat(width);
	s = (s + spaces).slice(0, width);
	console.log(s);
};

/** @param {string} [msg] */
export const clear = msg => {
	if (STATE.needsClearScreen)
		clearScreen();

	console.log(SCREEN.MOVE_CURSOR_UP(100));
	msg = msg ?? 'F1 - help';
	logAndClearLine(msg);
};
