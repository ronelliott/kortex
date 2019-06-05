require('should');
const expect = require('expect.js');
const sinon = require('sinon');

const State = require('../lib/State');

describe('State', function() {
	beforeEach(function() {
		this.state = new State({
			maybe: ['dunno', 'could be'],
			nope: false,
			something: true,
			totes: { foo: { bar: 'yup' } },
		});
	});

	describe('Generic', function() {
		describe('del', function() {
			it('should remove the key', function() {
				this.state.store.totes.should.eql({ foo: { bar: 'yup' } });
				this.state.del('totes');
				(!!this.state.store.totes).should.equal(false, 'Did not delete the key');
			});

			it('should notify watchers of the key update', function() {
				const spy = sinon.spy();
				this.state.watch('totes', spy);
				this.state.del('totes');
				spy.called.should.equal(true);
			});
		});

		describe('get', function() {
			it('should get the given key', function() {
				this.state.store.something.should.equal(true);
				this.state.get('something').should.equal(true);

				this.state.store.totes.foo.bar.should.equal('yup');
				this.state.get('totes.foo.bar').should.equal('yup');

				this.state.store.totes.should.eql({ foo: { bar: 'yup' } });
				this.state.get('totes').should.eql({ foo: { bar: 'yup' } });
			});

			it('should return the default value for non-existent keys', function() {
				this.state.get('stupid', 'totes').should.equal('totes');
			});

			it('should return the value for existent but falsy values', function() {
				this.state.get('nope', true).should.equal(false);
			});
		});

		describe('has', function() {
			it('should return true if the key exists', function() {
				this.state.has('totes').should.equal(true);
			});

			it('should return false if the key does not exist', function() {
				this.state.has('foo').should.equal(false);
			});
		});

		describe('set', function() {
			it('should set the key to the given value', function() {
				this.state.store.something.should.equal(true);
				this.state.set('something', false);
				this.state.store.something.should.equal(false);
			});

			it('should notify watchers of the key update', function() {
				const spy = sinon.spy();
				this.state.on('updated:something', spy);
				this.state.set('something', false);
				spy.called.should.equal(true);
				spy.calledWith(false).should.equal(true);
			});
		});
	});

	describe('Events', function() {
		describe('notifyUpdated', function() {
			it('should send an updated event', function() {
				const spy = sinon.spy();
				this.state.on('updated:something', spy);
				this.state.notifyUpdated('something', false);
				spy.called.should.equal(true);
				spy.calledWith(false).should.equal(true);
			});
		});

		describe('watch', function() {
			it('should call the callback when the key is updated', function() {
				const spy = sinon.spy();
				this.state.watch('something', spy);
				this.state.set('something', false);
				spy.called.should.equal(true);
			});
		});

		describe('unwatch', function() {
			it('should not call the callback after it has been removed', function() {
				const spy_1 = sinon.spy();
				const spy_2 = sinon.spy();
				this.state.watch('something', spy_1);
				this.state.watch('something', spy_2);

				this.state.set('something', false);
				spy_1.callCount.should.equal(1);
				spy_2.callCount.should.equal(1);

				this.state.unwatch('something', spy_1);

				this.state.set('something', false);
				spy_1.callCount.should.equal(1);
				spy_2.callCount.should.equal(2);
			});
		});
	});

	describe('Array', function() {
		describe('getArray', function() {
			it('should throw an error if the given key is not an array', function() {
				expect(() => this.state.getArray('nope')).to.throwException('Key "nope" is not an array');
			});

			it('should return the array if the given key is an array', function() {
				this.state.getArray('maybe').should.eql(['dunno', 'could be']);
			});
		});

		describe('filter', function() {
			it('should filter values into the same key if no new key is given', function() {
				this.state.store.maybe.should.eql(['dunno', 'could be']);
				this.state.filter('maybe', v => v != 'dunno');
				this.state.store.maybe.should.eql(['could be']);
			});

			it('should filter values into the new key if it is given', function() {
				this.state.store.maybe.should.eql(['dunno', 'could be']);
				this.state.filter('maybe', 'new_maybe', v => v != 'dunno');
				this.state.store.maybe.should.eql(['dunno', 'could be']);
				this.state.store.new_maybe.should.eql(['could be']);
			});

			it('should notify watchers of the key update', function() {
				const spy = sinon.spy();
				this.state.watch('maybe', spy);
				this.state.filter('maybe', v => v != 'dunno');
				spy.called.should.equal(true);
			});

			it('should not notify watchers of the current key if the new key is given', function() {
				const spy_1 = sinon.spy();
				const spy_2 = sinon.spy();
				this.state.watch('maybe', spy_1);
				this.state.watch('new_maybe', spy_2);
				this.state.filter('maybe', 'new_maybe', v => v != 'dunno');
				spy_1.called.should.equal(false);
				spy_2.called.should.equal(true);
			});
		});

		describe('map', function() {
			it('should map values into the same key if no new key is given', function() {
				this.state.store.maybe.should.eql(['dunno', 'could be']);
				this.state.map('maybe', v => `totes ${v}`);
				this.state.store.maybe.should.eql(['totes dunno', 'totes could be']);
			});

			it('should map values into the new key if it is given', function() {
				this.state.store.maybe.should.eql(['dunno', 'could be']);
				this.state.map('maybe', 'new_maybe', v => `totes ${v}`);
				this.state.store.maybe.should.eql(['dunno', 'could be']);
				this.state.store.new_maybe.should.eql(['totes dunno', 'totes could be']);
			});

			it('should notify watchers of the key update', function() {
				const spy = sinon.spy();
				this.state.watch('maybe', spy);
				this.state.map('maybe', v => `totes ${v}`);
				spy.called.should.equal(true);
			});

			it('should not notify watchers of the current key if the new key is given', function() {
				const spy_1 = sinon.spy();
				const spy_2 = sinon.spy();
				this.state.watch('maybe', spy_1);
				this.state.watch('new_maybe', spy_2);
				this.state.map('maybe', 'new_maybe', v => `totes ${v}`);
				spy_1.called.should.equal(false);
				spy_2.called.should.equal(true);
			});
		});

		describe('reduce', function() {
			it('should reduce values into the same key if no new key is given', function() {
				this.state.store.maybe.should.eql(['dunno', 'could be']);
				this.state.reduce('maybe', (all, v) => {
					all.push(`yup ${v}`);
					return all;
				});
				this.state.store.maybe.should.eql(['yup dunno', 'yup could be']);
			});

			it('should reduce values into the new key if it is given', function() {
				this.state.store.maybe.should.eql(['dunno', 'could be']);
				this.state.reduce('maybe', 'new_maybe', (all, v) => {
					all.push(`yup ${v}`);
					return all;
				});
				this.state.store.maybe.should.eql(['dunno', 'could be']);
				this.state.store.new_maybe.should.eql(['yup dunno', 'yup could be']);
			});

			it('should notify watchers of the key update', function() {
				const spy = sinon.spy();
				this.state.watch('maybe', spy);
				this.state.reduce('maybe', (all, v) => {
					all.push(`yup ${v}`);
					return all;
				});
				spy.called.should.equal(true);
			});

			it('should not notify watchers of the current key if the new key is given', function() {
				const spy_1 = sinon.spy();
				const spy_2 = sinon.spy();
				this.state.watch('maybe', spy_1);
				this.state.watch('new_maybe', spy_2);
				this.state.reduce('maybe', 'new_maybe', (all, v) => {
					all.push(`yup ${v}`);
					return all;
				});
				spy_1.called.should.equal(false);
				spy_2.called.should.equal(true);
			});
		});

		describe('pop', function() {
			it('should throw an error if the given key is not an array', function() {
				expect(() => this.state.pop('nope', 'nope')).to.throwException('Key "nope" is not an array');
			});

			it('should pop values from the given key', function() {
				this.state.store.maybe.should.eql(['dunno', 'could be']);
				this.state.pop('maybe').should.equal('could be');
				this.state.store.maybe.should.eql(['dunno']);
			});

			it('should notify watchers of the key update', function() {
				const spy = sinon.spy();
				this.state.watch('maybe', spy);
				this.state.pop('maybe', 'yup');
				spy.called.should.equal(true);
			});
		});

		describe('push', function() {
			it('should throw an error if the given key is not an array', function() {
				expect(() => this.state.push('nope', 'nope')).to.throwException('Key "nope" is not an array');
			});

			it('should push values into the given key', function() {
				this.state.store.maybe.should.eql(['dunno', 'could be']);
				this.state.push('maybe', 'yup');
				this.state.store.maybe.should.eql(['dunno', 'could be', 'yup']);
			});

			it('should notify watchers of the key update', function() {
				const spy = sinon.spy();
				this.state.watch('maybe', spy);
				this.state.push('maybe', 'yup');
				spy.called.should.equal(true);
			});
		});

		describe('shift', function() {
			it('should throw an error if the given key is not an array', function() {
				expect(() => this.state.shift('nope', 'nope')).to.throwException('Key "nope" is not an array');
			});

			it('should shift values into the given key', function() {
				this.state.store.maybe.should.eql(['dunno', 'could be']);
				this.state.shift('maybe').should.equal('dunno');
				this.state.store.maybe.should.eql(['could be']);
			});

			it('should notify watchers of the key update', function() {
				const spy = sinon.spy();
				this.state.watch('maybe', spy);
				this.state.shift('maybe', 'yup');
				spy.called.should.equal(true);
			});
		});

		describe('unshift', function() {
			it('should throw an error if the given key is not an array', function() {
				expect(() => this.state.unshift('nope', 'nope')).to.throwException('Key "nope" is not an array');
			});

			it('should unshift values into the given key', function() {
				this.state.store.maybe.should.eql(['dunno', 'could be']);
				this.state.unshift('maybe', 'yup');
				this.state.store.maybe.should.eql(['yup', 'dunno', 'could be']);
			});

			it('should notify watchers of the key update', function() {
				const spy = sinon.spy();
				this.state.watch('maybe', spy);
				this.state.unshift('maybe', 'yup');
				spy.called.should.equal(true);
			});
		});
	});

	describe('Boolean', function() {
		describe('toggle', function() {
			it('should toggle boolean values', function() {
				this.state.store.nope.should.equal(false);
				this.state.toggle('nope');
				this.state.store.nope.should.equal(true);
			});

			it('should notify watchers of the key update', function() {
				const spy = sinon.spy();
				this.state.watch('nope', spy);
				this.state.toggle('nope');
				spy.called.should.equal(true);
			});
		});
	});
});
