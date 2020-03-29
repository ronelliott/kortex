const sinon = require('sinon');

const Actions = require('../lib/Actions');

describe('Actions', function() {
	beforeEach(function() {
		this.available_actions = {
			maybe: sinon.spy(),
			totes: {
				nested: {
					action: sinon.spy(),
				},
			},
		};

		this.actions = new Actions(this.available_actions);
	});

	describe('misc', function() {
		it('should throw an error if no actions are given upon creation', function() {
			should(() => {
				new Actions();
			}).throw('No actions given');
		});
	});

	describe('call', function() {
		it('should call the given action', function() {
			this.available_actions.maybe.called.should.equal(false);
			this.actions.call('maybe');
			this.available_actions.maybe.called.should.equal(true);
		});

		it('should call the given nested action', function() {
			this.available_actions.totes.nested.action.called.should.equal(false);
			this.actions.call('totes.nested.action');
			this.available_actions.totes.nested.action.called.should.equal(true);
		});

		it('should throw an error when calling a non-existent action', function() {
			should(() => {
				this.actions.call('nope');
			}).throw('Undefined action: nope');
		});
	});

	describe('get', function() {
		it('should return the function', function() {
			should(this.actions.get('nope')).equal(undefined);
			const action = this.actions.get('maybe');
			action.should.equal(this.available_actions.maybe);
			action.should.not.equal(this.available_actions.totes.nested.action);
		});
	});

	describe('wrap', function() {
		it('should call the given action', function() {
			this.available_actions.maybe.called.should.equal(false);
			this.actions.wrap('maybe')();
			this.available_actions.maybe.called.should.equal(true);
		});

		it('should call the given nested action', function() {
			this.available_actions.totes.nested.action.called.should.equal(false);
			this.actions.wrap('totes.nested.action')();
			this.available_actions.totes.nested.action.called.should.equal(true);
		});

		it('should throw an error when calling a non-existent action', function() {
			should(() => {
				this.actions.wrap('nope')();
			}).throw('Undefined action: nope');
		});
	});
});
