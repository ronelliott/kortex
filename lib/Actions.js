const op = require('object-path');

const EventEmitter = require('events');

class Actions extends EventEmitter {
  constructor(actions) {
    super();
    this.actions = actions;
  }

  call(key, state, ...args) {
    const action = op.get(this.actions, key);
    if (!action) throw new Error(`Undefined action: ${key}`);
    return action(state, ...args);
  }
}

module.exports = Actions;
