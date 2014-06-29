var _ = require('lodash');
var debug = require('debug');
var onlyOnce = require('only-once');
var util = require('util');
var constant = require('./constant')
var EventEmitter = require('events').EventEmitter;
var retryAlgorithm = require('./retryAlgorithm.js');
util.inherits(Stubborn, EventEmitter);

function Stubborn(task, options, callback) {
	EventEmitter.call(this);
	this._debug = debug('Stubborn');
	this._setTimeout = setTimeout;
	this._task = task;
	if (_.isFunction(options)) {
		callback = options;
		options = {};
	}
	var maxAttempts = options.maxAttempts;
	this._maxAttempts = _.isUndefined(maxAttempts) ? 10 : maxAttempts;
	var delay = options.delay;
	this._delay = _.isUndefined(delay) ? 100 : delay;

	this._delayProgression = options.delayProgression || options.retryAlgorithm

	if (typeof (this._delayProgression) === 'string') {
		this._delayProgression = retryAlgorithm(this._delayProgression).apply(null, options.retryAlgorithmArgs || [])
	}
		
	if (!this._delayProgression) {
		this._delayProgression = constant(1);
	}

	this._callback = callback;
	this._attempt = 0;
	this._canceled = false;
	this._rerunBound = _.bind(this._rerun, this);
	this._onTaskExecutedBound = _.bind(this._onTaskExecuted, this);
}

var p = Stubborn.prototype;

p.run = function() {
	this._debug('run');
	var attempt = this._attempt;
	if (attempt !== 0) {
		throw new Error('Already running');
	}
	this.emit('run', attempt);
	this._attempt = attempt + 1;
	try {
		var onTaskExecuted = onlyOnce(this._onTaskExecutedBound);
		this._task(onTaskExecuted);
	} catch(e) {
		this._onTaskExecuted(e);
	}
};

p.cancel = function() {
	this._debug('cancel');
	this._canceled = true;
};

p._rerun = function() {
	this._debug('_rerun');
	this.run();
};

p._onTaskExecuted = function(err) {
	this._debug('_onTaskExecuted');
	if (err === undefined || err === null) {
		this._callback.apply(null, arguments);
		return;
	}
	this.emit('attemptError', err);
	var attempt = this._attempt;
	if (this._canceled || attempt >= this._maxAttempts) {
		this._callback(err);
		return;
	}
	var delay = this._delay;
	
	var factor = this._delayProgression(attempt);
	delay = delay * factor;
	
	this.emit('schedule', delay, attempt);
	this._setTimeout(this._rerunBound, delay);
};

delete p;

module.exports = Stubborn;
