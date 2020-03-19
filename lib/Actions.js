const op = require('object-path');

class Actions {
  constructor(actions) {
    if (!actions) throw new Error('No actions given');
    this.actions = actions;
  }

  call(name, state, ...args) {
    const action = this.get(name);
    if (!action) throw new Error(`Undefined action: ${name}`);
    const context = this.getActionContext(state);
    return action(context, ...args);
  }

  get(name) {
    return op.get(this.actions, name);
  }

  getActionContext(state) {
    return {
      actions: this,
      state,
    };
  }

  wrap(name, state) {
    const action = this.get(name);
    if (!action) throw new Error(`Undefined action: ${name}`);
    const context = this.getActionContext(state);
    return (...args) => action(context, ...args);
  }
}

module.exports = Actions;
