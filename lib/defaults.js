module.exports = {
	getDefaultActions,
	setDefaultActions,
	getDefaultState,
	setDefaultState,
};

const Actions = require('./Actions');
const State = require('./State');

let DefaultActions = new Actions();
let DefaultState = new State();

function getDefaultActions() {
	return DefaultActions;
}

function setDefaultActions(actions) {
	DefaultActions = actions;
}

function getDefaultState() {
	return DefaultState;
}

function setDefaultState(state) {
	DefaultState = state;
}
