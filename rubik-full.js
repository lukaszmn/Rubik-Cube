import { emitKeypressEvents } from 'readline';

import { readCube } from './src/cube-utils/read-cube';
import { targetCube } from './src/cube-utils/target-cube';
import { loadState } from './src/data/persistence';
import { initState, MODE, STATE } from './src/data/state';
import { processKeyInEdit } from './src/editing/editor';
import { processKey } from './src/process-key';
import { displayCurrentCube, redrawWithTitle } from './src/UI/ui';


const cube = readCube(targetCube);

// act(cube, true, "RUR'URUUR'");

initState(cube);
loadState();

redrawWithTitle();
displayCurrentCube();

emitKeypressEvents(process.stdin);
if (process.stdin.isTTY)
	process.stdin.setRawMode(true);

process.stdin.on('keypress', (str, key) => {
	if (STATE.typingMode)
		return;
	// esc, CTRL+C
	if (key.name === 'escape' || key.sequence === '\x03')
		process.exit();

	let keyName = key.name || str;
	if (key.shift && keyName.length === 1)
		keyName = keyName.toUpperCase();

	// console.log(keyName, str, key);

	switch (STATE.mode) {
		case MODE.BROWSE:
		case MODE.RECORD:
		case MODE.ROTATED_MOVEMENTS:
			processKey(keyName, key.shift);
			break;

		case MODE.EDIT:
		case MODE.OPTIMIZE_SOURCE:
		case MODE.OPTIMIZE_TARGET:
			processKeyInEdit(keyName, key.shift, key.ctrl);
			break;
	}
});
