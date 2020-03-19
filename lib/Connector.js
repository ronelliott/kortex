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
            ...connector.getAll(requested),
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
