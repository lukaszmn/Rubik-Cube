import * as fs from 'fs';

import { DIFF_MODE, STATE } from './state';

const FILE = 'config.json';

export const loadState = () => {
	if (!fs.existsSync(FILE))
		return;

	const fileContents = fs.readFileSync(FILE, 'utf-8');
	const data = JSON.parse(fileContents);
	STATE.savedRecordings = data.savedRecordings;
	STATE.showColors = data.showColors === undefined ? true : data.showColors;
	STATE.showDiff = data.showDiff === undefined ? DIFF_MODE.NONE : data.showDiff;
	STATE.cellLabels = data.cellLabels === undefined ? true : data.cellLabels;
	STATE.animationSpeed = data.animationSpeed;
};

export const saveState = () => {
	const data = {
		savedRecordings: STATE.savedRecordings,
		showColors: STATE.showColors,
		showDiff: +STATE.showDiff,
		cellLabels: STATE.cellLabels,
		animationSpeed: STATE.animationSpeed,
	};

	const fileContents = JSON.stringify(data, null, 2);
	fs.writeFileSync(FILE, fileContents);
};
