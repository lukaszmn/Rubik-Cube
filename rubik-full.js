import { emitKeypressEvents } from 'readline';
import { displayCube } from './src/display-cube';
import { processKeyInEdit } from './src/editor';
import { loadState } from './src/persistence';
import { processKey } from './src/process-key';
import { readCube } from './src/read-cube';
import { STATE, initState, MODE } from './src/state';
import { targetCube } from './src/target-cube';
import { clear } from './src/terminal-output';


const cube = readCube(targetCube);

// act(cube, true, "RUR'URUUR'");

initState(cube);
loadState();

clear();
displayCube(cube, true);

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
			processKey(keyName, key.shift);
			break;

		case MODE.EDIT:
		case MODE.OPTIMIZE_SOURCE:
		case MODE.OPTIMIZE_TARGET:
			processKeyInEdit(keyName, key.shift, key.ctrl);
			break;
	}
});
