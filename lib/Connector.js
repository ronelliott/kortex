const React = require('react');

class Connector {
  constructor(actions, state) {
    if (!actions) throw new Error('No actions given');
    if (!state) throw new Error('No state given');
    this.actions = actions;
    this.state = state;
  }

  connect(Component, requested) {
    const state_keys = Object.values(requested);
    const parent = this;

    return class ConnectedComponent extends React.Component {
      componentDidMount() {
        state_keys.map(key => parent.state.watch(key, this.forceUpdate));
      }

      componentWillUnmount() {
        state_keys.map(key => parent.state.unwatch(key, this.forceUpdate));
      }

      render() {
        return React.createElement(
          Component,
          {
            ...this.props,
            ...parent.getAll(requested),
          },
          this.props.children
        );
      }
    };
  }

  get(path) {
    const source = path.substr(0, path.indexOf('.'));
    const sub_path = path.substr(source.length + 1);

    if (source == 'actions') {
      return this.actions.wrap(sub_path);
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
}

module.exports = Connector;
