import * as readline from 'readline';

import { STATE } from '../../state';

let rl;
let created = false;

export const question = (prompt, callback) => {
	if (process.stdin.isTTY)
		process.stdin.setRawMode(false);
	STATE.typingMode = true;

	if (!created) {
		rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			terminal: true,
		});
		created = true;
	} else {
		// rl.resume();
	}

	rl.question(prompt, answer => {
		// TODO: 1. either of close() or pause() stops the application
		// rl.close();
		// rl.pause();
		// TODO: 2. moving readline.createInterface() out of this method causes that user's answer contains "\x1B[[D"
		// see maybe: https://github.com/SBoudrias/Inquirer.js/blob/master/packages/core/index.js

		if (process.stdin.isTTY)
			process.stdin.setRawMode(true);
		STATE.typingMode = false;

		// show hex codes
		// console.log('[[[' + Array.from(answer).map(c => c.charCodeAt(0) < 128 ? c.charCodeAt(0).toString(16) : encodeURIComponent(c).replace(/\%/g,'').toLowerCase()).join(' ') + ']]]');

		callback(answer);
	});

};

export const questionAsync = prompt => new Promise(resolve => question(prompt, res => resolve(res)));
