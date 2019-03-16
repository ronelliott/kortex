module.exports = init;

const Actions = require('./Actions');
const State = require('./State');
const defaults = require('./defaults');

function init(modules) {
	const actions = new Actions();
	defaults.setDefaultActions(actions);

	const state = new State();
	defaults.setDefaultState(state);
}
