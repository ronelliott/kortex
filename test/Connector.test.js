const enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');
enzyme.configure({ adapter: new Adapter() });

const React = require('react');
const sinon = require('sinon');

const Actions = require('../lib/Actions');
const Connector = require('../lib/Connector');
const State = require('../lib/State');

describe('Connector', function() {
  beforeEach(function() {
    this.available_actions = {
      doSomething: sinon.spy(),
    };
    this.actions = new Actions(this.available_actions);
    this.starting_state = {
      totes: 'yup',
      foo: true,
    };
    this.state = new State(this.starting_state);
    this.connector = new Connector(this.actions, this.state);
  });

  describe('misc', function() {
    it('should throw an error if no actions are given upon creation', function() {
      should(() => {
        new Connector(null, this.state);
      }).throw('No actions given');
    });

    it('should throw an error if no state is given upon creation', function() {
      should(() => {
        new Connector(this.actions, null);
      }).throw('No state given');
    });
  });

  describe('make', function() {
    it('should build actions correctly', function() {
      const { actions } = Connector.make({
        something: {
          actions: this.available_actions,
        },
      });

      actions.actions.should.eql({ something: this.available_actions });
    });

    it('should build state correctly', function () {
      const { state } = Connector.make({
        something: {
          state: this.starting_state,
        },
      });

      state.store.should.eql({ something: this.starting_state });
    });
  });

  describe('connect', function() {
    beforeEach(function() {
      this.RawComponent = sinon.spy(({ totes }) => (totes || 'empty'));
    });

    it('should properly connect components', function() {
      const ConnectedComponent = this.connector.connect(this.RawComponent, {
        totes: 'state.totes',
      });

      const element = React.createElement(ConnectedComponent);
      const component = enzyme.shallow(element);
      component.html().should.equal(this.starting_state.totes);
    });

    it('should allow empty requested keys', function () {
      const ConnectedComponent = this.connector.connect(this.RawComponent);
      const element = React.createElement(ConnectedComponent);
      const component = enzyme.shallow(element);
      component.html().should.equal('empty');
    });

    it('should subscribe to updates for interested keys when mounting', function() {
      this.state.watch = sinon.spy(this.state.watch);
      const ConnectedComponent = this.connector.connect(this.RawComponent, {
        totes: 'state.totes',
      });

      const element = React.createElement(ConnectedComponent);
      const component = enzyme.shallow(element);
      component.unmount();
      this.state.watch.called.should.equal(true);
    });

    it('should unsubscribe from updates for interested keys when unmounting', function() {
      this.state.unwatch = sinon.spy(this.state.unwatch);
      const ConnectedComponent = this.connector.connect(this.RawComponent, {
        totes: 'state.totes',
      });

      const element = React.createElement(ConnectedComponent);
      const component = enzyme.shallow(element);
      component.unmount();
      this.state.unwatch.called.should.equal(true);
    });
  });

  describe('get', function() {
    it('should get action values', function() {
      const action = this.connector.get('actions.doSomething');
      this.available_actions.doSomething.called.should.equal(false);
      action();
      this.available_actions.doSomething.called.should.equal(true);
    });

    it('should get action values', function() {
      this.connector.get('state.foo').should.equal(this.starting_state.foo);
      this.connector.get('state.totes').should.equal(this.starting_state.totes);
    });

    it('should throw an error for an unknown prefix', function() {
      should(() => {
        this.connector.get('totes.break');
      }).throw('Unknown source: "totes"');
    });
  });

  describe('getAll', function() {
    it('should get values correctly', function() {
      const things = this.connector.getAll({
        key1: 'actions.doSomething',
        key2: 'state.foo',
        key3: 'state.totes',
      });
      this.available_actions.doSomething.called.should.equal(false);
      things.key1();
      this.available_actions.doSomething.called.should.equal(true);
      things.key2.should.equal(this.starting_state.foo);
      things.key3.should.equal(this.starting_state.totes);
    });
  });
});
