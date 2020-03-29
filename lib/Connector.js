const React = require('react');

const Actions = require('./Actions');
const State = require('./State');

class Connector {
  constructor(actions, state) {
    if (!actions) throw new Error('No actions given');
    if (!state) throw new Error('No state given');
    this.actions = actions;
    this.state = state;
  }

  static make(modules) {
    const actionsRaw = {};
    const stateRaw = {};

    Object.entries(modules).forEach(([prefix, { actions, state }]) => {
      if (actions) actionsRaw[prefix] = actions;
      if (state) stateRaw[prefix] = state;
    });

    const actions = new Actions(actionsRaw);
    const state = new State(stateRaw);
    const connector = new Connector(actions, state);

    return {
      actions,
      state,
      connect: connector.connect.bind(connector),
      connector,
    };
  }

  connect(Component, requested) {
    const state_keys = Object.values(requested || {});
    const connector = this;

    return class ConnectedComponent extends React.Component {
      constructor(...args) {
        super(...args);
        this.doForceUpdate = () => this.forceUpdate();
      }

      componentDidMount() {
        state_keys.map(key => {
          const { sub_path } = connector.parsePath(key);
          connector.state.watch(sub_path, this.doForceUpdate);
        });
      }

      componentWillUnmount() {
        state_keys.map(key => {
          const { sub_path } = connector.parsePath(key);
          connector.state.unwatch(sub_path, this.doForceUpdate);
        });
      }

      render() {
        return React.createElement(
          Component,
          {
            ...this.props,
            ...connector.getAll(requested || {}),
          },
          this.props.children
        );
      }
    };
  }

  get(path) {
    const { source, sub_path } = this.parsePath(path);

    if (source == 'actions') {
      return this.actions.wrap(sub_path, this.state);
    }

    else if (source == 'state') {
      return this.state.get(sub_path);
    }

    throw new Error(`Unknown source: "${source}"`);
  }

  getAll(paths) {
    return Object.entries(paths).reduce(
      (all, [name, path]) => {
        all[name] = this.get(path);
        return all;
      },
    {});
  }

  parsePath(path) {
    const source = path.substr(0, path.indexOf('.'));
    const sub_path = path.substr(source.length + 1);

    return {
      source,
      sub_path,
    }
  }
}

module.exports = Connector;
