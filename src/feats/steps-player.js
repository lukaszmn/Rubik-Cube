import { cloneCube } from '../cube-utils/clone-cube';
import { getIdentifierCube } from '../cube-utils/identifier-cube';
import * as CubeTypes from '../cube-utils/identifier-cube';
import { expandMovements, getStepNumberToStringIndexMap, reverseMovements } from '../movements-utils';
import { getMovementsForRotations } from './movements-rotated';

export const StepsPlayer = {

	_startCube: getIdentifierCube(),
	_steps: '',
	_index: 0,
	_length: 0,
	/** @type {string} list of rotations to apply to steps */
	rotations: '',

	/**
	 * @param {CubeTypes.Cube} cube
	 * @param {string} movements
	 */
	init: function(cube, movements) {
		this._startCube = cloneCube(cube);
		this._steps = ' ' + expandMovements(movements);
		this._index = -1;
		this._length = getStepNumberToStringIndexMap(this._steps).length;
		this.rotations = '';
	},

	/** @return {string | undefined} */
	stepForward: function() {
		if (this._index >= this._length - 1)
			return undefined;

		return this._getMovementsDiff(() => ++this._index);
	},

	/** @return {string | undefined} */
	stepBackward: function() {
		if (this._index <= -1)
			return undefined;

		return this._getMovementsDiff(() => --this._index);
	},

	/** @return {string | undefined} */
	goToStart: function() {
		return this._getMovementsDiff(() => this._index = -1);
	},

	/** @return {string | undefined} */
	goToEnd: function() {
		return this._getMovementsDiff(() => this._index = this._length - 1);
	},

	/** @return {{ steps: string, index: number, len: number }} */
	getDisplayInfo: function() {
		const steps = this._rotate(this._steps);
		if (this._index === -1)
			return { steps, index: 0, len: 1 };

		const map = getStepNumberToStringIndexMap(steps);
		const index = map[this._index];
		const len = (index + 1 < steps.length && steps[index + 1] === "'") ? 2 : 1;
		return { steps, index, len };
	},

	/** @return {string} */
	_getCurrentMovements: function() {
		const steps = this._steps;
		const map = getStepNumberToStringIndexMap(steps);
		let index = map[this._index];
		if (index + 1 < steps.length && steps[index + 1] === "'")
			++index;
		return this._steps.slice(0, index + 1);
	},

	/**
	 * @param {function} func
	 * @return {string | undefined}
	 */
	_getMovementsDiff: function(func) {
		const before = this._getCurrentMovements();
		func();
		const after = this._getCurrentMovements();

		if (before === after)
			return undefined;

		if (before.length < after.length) {
			const addedSteps = after.slice(before.length);
			// console.log("ADDED " + addedSteps);
			return this._rotate(addedSteps);
		}

		if (before.length > after.length) {
			const revertedSteps = reverseMovements(before.slice(after.length));
			// console.log("REVERTED " + revertedSteps);
			return this._rotate(revertedSteps);
		}

		throw new Error();
	},

	/**
	 * @param {string} steps
	 * @return {string}
	 */
	_rotate: function(steps) {
		return getMovementsForRotations(this.rotations, steps);
	},

};
