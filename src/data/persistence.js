import * as fs from 'fs';

import { STATE } from './state';

const FILE = 'config.json';

export const loadState = () => {
	if (!fs.existsSync(FILE))
		return;

	const fileContents = fs.readFileSync(FILE, 'utf-8');
	const data = JSON.parse(fileContents);
	STATE.savedRecordings = data.savedRecordings;
};

export const saveState = () => {
	const data = {
		savedRecordings: STATE.savedRecordings
	};

	const fileContents = JSON.stringify(data, null, 2);
	fs.writeFileSync(FILE, fileContents);
};
