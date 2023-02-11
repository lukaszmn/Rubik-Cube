import * as CubeTypes from '../../cube-utils/identifier-cube';
import * as ValidateTypes from '../../cube-utils/validate';
import { DIFF_MODE, MODE, STATE } from '../../data/state';
import * as HighlightTypes from '../../editing/cell-highlight';
import { displayCube } from './display-cube';
import { question } from './question';
import { clear, colors, highlight, highlightMagenta, logAndClearLine } from './terminal-output';
/**
 * @param {string} msg
 */
export const alertInfo = msg => {
	console.log(msg);
};

/**
 * @param {string} msg
 */
export const alertError = msg => {
	console.log(`ERROR: ${msg}`);
};

/**
 * @callback questionCallback
 * @param {string} answer
 */
/**
 * @param {string} prompt
 * @param {questionCallback} callback
 */
export const askQuestion = (prompt, callback) => {
	question(prompt, callback);
};

/**
 * @param {object} [options] Optional options
 * @param {HighlightTypes.CellHighlight[]} [options.highlightCells]
 * @param {CubeTypes.Cube} [options.animate]
 */
export const displayCurrentCube = options => {
	if (!options)
		displayCube(STATE.c);
	else if (options.highlightCells)
		displayCube(STATE.c, options.highlightCells, true);
	else if (options.animate)
		displayCube(options.animate, undefined, true);
};

/**
 * @param {string} [title]
 */
export const redrawWithTitle = title => {
	clear(title);
};

/* cube-diff */

/**
 * @param {CubeTypes.Cube} diff
 */
export const showPreviousCubeDiff = diff => {
	console.log('\n\nPREVIOUS CUBE:');
	displayCube(diff, undefined, true);
};

/**
 * @param {CubeTypes.Cube} diff
 */
export const showCurrentCubeDiff = diff => {
	console.log('\n\nCURRENT CUBE:');
	displayCube(diff, undefined, true);
};

/* editor */

/**
 * @param {string} step
 */
export const editor_showMovement = step => {
	if (step)
		console.log(`Movement: ${step}`);
	else
		console.log();
};

export const editor_showHints = () => {
	switch (STATE.mode) {
		case MODE.EDIT: redrawWithTitle('E D I T   M O D E'); break;
		case MODE.OPTIMIZE_SOURCE: redrawWithTitle('O P T I M I Z E   -   E D I T   I N I T I A L   C U B E'); break;
		case MODE.OPTIMIZE_TARGET: redrawWithTitle('O P T I M I Z E   -   E D I T   T A R G E T   C U B E'); break;
	}

	console.log(
		'F2 - exit edit ' +
		'| arrow keys - move cursor ' +
		'| SHIFT + arrows - move cube ' +
		'| CTRL + arrows - go to face ' +
		'| PG UP/DOWN - cursor auto movement mode '
	);
	console.log(
		'               ' +
		'| R/G/B/O/W/Y/- - place color, with SHIFT - color entire face, repeat key for more modes ' +
		'| =/+ - reset/clear cube ' +
		'| CTRL + L/S - load/save state'
	);
	console.log();
};

/**
 * @param {ValidateTypes.ValidateRes} res
 */
export const editor_showValidation = res => {
	let s = '  Counts: ';

	s += Array.from('RGBOWY-')
		.map(col => {
			const formatColor = colors[col] || 'Q';
			const formattedColorName = formatColor.replace('Q', col);

			const count = res.colorsSum.counts[col];
			let formattedCount = count;
			if (col !== '-') {
				const optionalHighlight = count === 9 ? 'Q' : highlight;
				formattedCount = optionalHighlight.replace('Q', count);
			}

			return formattedColorName + ' ' + formattedCount;
		}).join(',  ');

	if (res.colorsSum.valid) {
		if (res.permutations.info.corners !== 0)
			s += ` | ${res.permutations.info.corners} corners illegally rotated`;
		if (res.permutations.info.edges !== 0)
			s += ' | edges illegally swapped';
		if (res.permutations.info.corners === 0 && res.permutations.info.edges === 0 && !res.permutations.info.parity)
			s += ' | Too many corners or edges permutated';
		if (res.permutations.info.illegalColors)
			s += ` | Piece contains invalid colors: ${res.permutations.info.illegalColors}`;
	}

	s += ' - ';
	s += (res.colorsSum.valid && res.permutations.valid)
		? colors.G.replace('Q', 'OK')
		: colors.R.replace('Q', 'INVALID');
	logAndClearLine(s);
};

/* process-key */

export const main_showHelp = () => {
	console.log('F1 - help');
	console.log('F2 - edit mode');
	console.log('F3 - record movements');
	console.log('F4 - show movements for rotated cube');
	console.log('F5 - perform moves');
	console.log('CTRL+F5 - play moves');
	console.log('F6 - optimize algorithm');
	console.log('F7 - show diff');
	console.log('F8 - show/hide cell labels');
	console.log('F9 - options');
	console.log('. - toggle identifiers/colors');
	console.log('escape or CTRL+C - exit');
	console.log();
	console.log('backspace - undo last move');
	console.log('arrow keys - rotate');
	console.log('= - reset');
	console.log('` - scramble');
	console.log('Movements: UDLRFB udlrfb MES xyz');
	console.log("Press 'U to create movement U'");
	console.log();

	console.log('Saved recordings:');
	for (const rec of STATE.savedRecordings)
		console.log(`  ${rec.key} (${rec.name}): ${rec.movements}`);
};

export const recording_started = () => {
	console.log('Recording movements. Press F3 again to save');
};

export const recording_summary = () => {
	if (STATE.recording === '') {
		console.log('No movements were recorded');
	} else {
		console.log('Recorded movements:');
		for (const rec of STATE.savedRecordings)
			console.log(`  ${rec.key}: ${rec.movements}`);
		console.log(`  <CURRENT>: ${STATE.recording}`);
	}
};

/**
 * @param {string} answer
 */
export const recording_answered = answer => {
	console.log(`ANSWER ${answer}`);
};

export const rotations_started = () => {
	console.log('Now rotate the cube to see movements for the new orientation. Press F4 again to exit');
};

/**
 * @param {string} steps
 */
export const rotations_formula = steps => {
	console.log(`Rotated movement: ${steps}`);
};

export const diffs_showMode = () => {
	switch (STATE.showDiff) {
		case DIFF_MODE.NONE: console.log('Show differences - previous cube only'); break;
		case DIFF_MODE.PREVIOUS: console.log('Show differences - both previous and next cube'); break;
		case DIFF_MODE.BOTH: console.log('Hide differences'); break;
	}
};

export const playing_showState = () => {
	const { steps, index, len } = STATE.playing.getDisplayInfo();
	const s = steps.slice(0, index) + highlightMagenta.replace('Q', steps.slice(index, index + len)) + steps.slice(index + len);
	console.log('Playing steps: ' + s);
	console.log('Press CTRL+F5 to end, PG UP / PG DOWN / HOME / END to play forward or backward');
};
