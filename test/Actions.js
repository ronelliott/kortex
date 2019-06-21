require('should');
const expect = require('expect.js');
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

	it('should throw an error when calling a non-existant action', function() {
		should(() => {
			this.actions.call('nope');
		}).throw('Undefined action: nope');
	});
});
