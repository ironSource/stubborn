var _ = require('lodash');
var chai = require('chai');
var events = require('events');

var assert = chai.assert;

var EventEmitter = events.EventEmitter;

var Stubborn = require('../lib/Stubborn.js');

describe('Stubbon', function() {

	it('constructs with options', function() {

		var testOptions = {
			maxAttempts: 'testMaxAttempts',
			delay: 'testDelay',
			delayProgression: 'testDelayProgression'
		};

		var stubbon = new Stubborn('testTask', testOptions, 'testCallback');

		assert.instanceOf(stubbon, EventEmitter);
		assert.strictEqual(stubbon._setTimeout, setTimeout);
		assert.strictEqual(stubbon._task, 'testTask');
		assert.strictEqual(stubbon._callback, 'testCallback');
		assert.strictEqual(stubbon._maxAttempts, 'testMaxAttempts');
		assert.strictEqual(stubbon._delay, 'testDelay');
		assert.strictEqual(stubbon._delayProgression, 'testDelayProgression');
		assert.strictEqual(stubbon._attempt, 0);
		assert.isFunction(stubbon._rerunBound);
		assert.isFunction(stubbon._onTaskExecutedBound);

	});

	it('constructs without options', function() {

		var testCallback = function() {};

		var stubbon = new Stubborn('testTask', testCallback);

		assert.instanceOf(stubbon, EventEmitter);
		assert.strictEqual(stubbon._setTimeout, setTimeout);
		assert.strictEqual(stubbon._task, 'testTask');
		assert.strictEqual(stubbon._callback, testCallback);
		assert.strictEqual(stubbon._maxAttempts, 10);
		assert.strictEqual(stubbon._delay, 100);
		assert.isUndefined(stubbon._delayProgression);
		assert.strictEqual(stubbon._attempt, 0);
		assert.isFunction(stubbon._rerunBound);
		assert.isFunction(stubbon._onTaskExecutedBound);

	});

	it('run when task does not throw an exception', function() {

		var mockTaskCallCount = 0;
		var mockEmitCallCount = 0;
		var mockOnTaskExecutedBoundCallCount = 0;

		var mock = {

			_debug: function() {

			},

			_task: function(callback) {
				callback('testError');
				mockTaskCallCount++;
			},

			emit: function(type, attempt) {
				assert.strictEqual(type, 'run');
				assert.strictEqual(attempt, 0);
				mockEmitCallCount++;
			},

			_onTaskExecutedBound: function(err) {
				assert.strictEqual(err, 'testError');
				mockOnTaskExecutedBoundCallCount++;
			},

			_attempt: 0

		};

		Stubborn.prototype.run.call(mock);

		assert.strictEqual(mock._attempt, 1);
		assert.strictEqual(mockTaskCallCount, 1);
		assert.strictEqual(mockEmitCallCount, 1);
		assert.strictEqual(mockOnTaskExecutedBoundCallCount, 1);

	});

	it('run when task throws an exception', function() {

		var mockTaskCallCount = 0;
		var mockOnTaskExecutedCallCount = 0;
		var mockOnTaskExecutedBoundCallCount = 0;
		var mockEmitCallCount = 0;

		var mock = {

			_debug: function() {

			},

			_task: function(callback) {
				callback('testError');
				mockTaskCallCount++;
				throw new Error('Test exception');
			},

			emit: function(type, attempt) {
				assert.strictEqual(type, 'run');
				assert.strictEqual(attempt, 0);
				mockEmitCallCount++;
			},

			_onTaskExecutedBound: function(err) {
				assert.strictEqual(err, 'testError');
				mockOnTaskExecutedBoundCallCount++;
			},

			_onTaskExecuted: function(err) {
				assert(err instanceof Error);
				assert.strictEqual(err.message, 'Test exception');
				mockOnTaskExecutedCallCount++;
			},

			_attempt: 0

		};

		Stubborn.prototype.run.call(mock);

		assert.strictEqual(mock._attempt, 1);
		assert.strictEqual(mockTaskCallCount, 1);
		assert.strictEqual(mockOnTaskExecutedCallCount, 1);
		assert.strictEqual(mockOnTaskExecutedBoundCallCount, 1);
		assert.strictEqual(mockEmitCallCount, 1);

	});

	it('_rerun', function() {

		var mockRunCallCount = 0;

		var mock = {

			_debug: function() {

			},

			run: function() {
				mockRunCallCount++;
			}

		};

		Stubborn.prototype._rerun.call(mock);

		assert.strictEqual(mockRunCallCount, 1);

	});

	it('_onTaskExecuted without an error', function() {

		var mockCallbackCallCount = 0;

		var mock = {

			_debug: function() {

			},

			_callback: function(err) {
				assert.deepEqual(_.toArray(arguments), [null, 'testArgA', 'testArgB']);
				mockCallbackCallCount++;
			}

		};

		Stubborn.prototype._onTaskExecuted.call(mock, null, 'testArgA', 'testArgB');

		assert.strictEqual(mockCallbackCallCount, 1);

	});

	it('_onTaskExecuted with an error and max attempts reached', function() {

		var mockEmitCallCount = 0;
		var maxCallbackCallCount = 0;

		var mock = {

			_debug: function() {

			},

			emit: function(type, error) {
				assert.strictEqual(type, 'attemptError')
				assert.strictEqual(error, 'testError');
				mockEmitCallCount++;
			},

			_attempt: 1,

			_maxAttempts: 1,

			_callback: function(err) {
				assert(err instanceof Error);
				assert.strictEqual(err.message, 'testError');
				maxCallbackCallCount++;
			}
		};

		Stubborn.prototype._onTaskExecuted.call(mock, 'testError');

		assert.strictEqual(mockEmitCallCount, 1);
		assert.strictEqual(maxCallbackCallCount, 1);

	});

	it('_onTaskExecuted with an error and max attempts is not reached', function() {

		var mockEmitCallCount = 0;
		var mockSetTimeoutCallCount = 0;

		var mock = {

			_debug: function() {

			},

			emit: function(type, error) {
				if (mockEmitCallCount === 0) {
					assert.deepEqual(_.toArray(arguments), ['attemptError', 'testError']);
				}
				if (mockEmitCallCount === 1) {
					assert.deepEqual(_.toArray(arguments), ['schedule', 'testDelay', 0]);
				}
				mockEmitCallCount++;
			},

			_attempt: 0,

			_maxAttempts: 1,

			_delay: 'testDelay',

			_rerunBound: 'testRerunBound',

			_setTimeout: function(callback, delay) {
				assert.strictEqual(callback, 'testRerunBound');
				assert.strictEqual(delay, 'testDelay');
				mockSetTimeoutCallCount++;
			}

		};

		Stubborn.prototype._onTaskExecuted.call(mock, 'testError');

		assert.strictEqual(mockEmitCallCount, 2);
		assert.strictEqual(mockSetTimeoutCallCount, 1);

	});

});