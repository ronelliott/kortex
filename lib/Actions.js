const op = require('object-path');

class Actions {
  constructor(actions) {
    if (!actions) throw new Error('No actions given');
    this.actions = actions;
  }

  call(name, state, ...args) {
    const action = this.get(name);
    if (!action) throw new Error(`Undefined action: ${name}`);
    return action(state, ...args);
  }

  get(name) {
    return op.get(this.actions, name);
  }

  wrap(name, state) {
    const action = this.get(name);
    if (!action) throw new Error(`Undefined action: ${name}`);
    return (...args) => action(state, ...args);
  }
}

module.exports = Actions;
