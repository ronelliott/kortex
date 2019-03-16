module.exports = {
	DefaultState,
	setDefaultState,
};

const State = require('./state');

let DefaultState = new State();

function setDefaultState(state) {
	DefaultState = state;
}
