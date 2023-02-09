import { DIFF_MODE, MODE, STATE } from '../../state';
import { displayCube } from './display-cube';
import { question } from './question';
import { clear, colors, highlight, logAndClearLine } from './terminal-output';

export const alertInfo = msg => {
	console.log(msg);
};

export const alertError = msg => {
	console.log(`ERROR: ${msg}`);
};

export const askQuestion = (prompt, callback) => {
	question(prompt, callback);
};

export const displayCurrentCube = options => {
	if (!options)
		displayCube(STATE.c);
	else if (options.highlightCells)
		displayCube(STATE.c, options.highlightCells, true);
	else if (options.animate)
		displayCube(options.animate, undefined, true);
};

export const redrawWithTitle = title => {
	clear(title);
};

/* cube-diff */

export const showPreviousCubeDiff = diff => {
	console.log('\n\nPREVIOUS CUBE:');
	displayCube(diff, undefined, true);
};

export const showCurrentCubeDiff = diff => {
	console.log('\n\nCURRENT CUBE:');
	displayCube(diff, undefined, true);
};

/* editor */

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
		'| = - reset cube ' +
		'| CTRL + L/S - load/save state'
	);
	console.log();
};

export const editor_showValidation = res => {
	let s = '  Counts: ';
	s += Array.from('RGBOWY-')
		.map(col => {
			const formatColor = colors[col] || 'Q';
			const formattedColorName = formatColor.replace('Q', col);

			const optionalHighlight = res.counts[col] === 9 ? 'Q' : highlight;
			const formattedCount = optionalHighlight.replace('Q', res.counts[col]);

			return formattedColorName + ' ' + formattedCount;
		}).join(',  ');
	s += res.valid ? '' : ' - INVALID';
	logAndClearLine(s);
};

/* process-key */

export const main_showHelp = () => {
	console.log('F1 - help');
	console.log('F2 - edit mode');
	console.log('F3 - record movements');
	console.log('F4 - show movements for rotated cube');
	console.log('F5 - perform moves');
	console.log('F6 - optimize algorithm');
	console.log('F7 - show diff');
	console.log('F8 - show/hide cell labels');
	console.log('backspace - undo last move');
	console.log('arrow keys - rotate');
	console.log('= - reset');
	console.log('` - scramble');
	console.log('. - toggle identifiers/colors');
	console.log('escape or CTRL+C - exit');
	console.log('Movements: UDLRFB udlrfb MES xyz');
	console.log("Press 'U to create movement U'");
	console.log();

	console.log('Saved recordings:');
	for (const rec of STATE.savedRecordings)
		console.log(`  ${rec.key}: ${rec.movements}`);
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

export const recording_answered = answer => {
	console.log(`ANSWER ${answer}`);
};

export const rotations_started = () => {
	console.log('Now rotate the cube to see movements for the new orientation. Press F4 again to exit');
};

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