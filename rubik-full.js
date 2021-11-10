import { emitKeypressEvents } from 'readline';
import { displayCube } from './src/display-cube';
import { processKeyInEdit } from './src/editor';
import { processKey } from './src/process-key';
import { readCube } from './src/read-cube';
import { STATE, initState } from './src/state';
import { targetCube } from './src/target-cube';
import { clear } from './src/terminal-output';


const sampleCube = [
	'Y',                  // 0
	' Y G Y O Y Y Y Y',   // 1
	'OOY RBB YRB RGG',    // 2
	'BBB RRR GGG OOO',    // 3
	'BBB RRR GGG OOO',    // 4
	' W W W W W W W W',   // 5
	'W'                   // 6
];

const markedCube = [
	'Y',                  // 0
	' Y Y Y Y . Y Y Y',   // 1
	'BBB RRR GGG OOO',    // 2
	'BB. RR. GG. OO.',    // 3
	'BBB RRR GGG OOO',    // 4
	' W W W W . W W W',   // 5
	'W'                   // 6
];


// let cube = readCube(sampleCube);
let cube = readCube(targetCube);
// let cube = readCube(markedCube);

// act(cube, true, "RUR'URUUR'");


initState(cube);

clear();
displayCube(cube);

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

	if (!STATE.editMode)
		processKey(keyName, key.shift);
	else
		processKeyInEdit(keyName, key.shift, key.ctrl);
});
