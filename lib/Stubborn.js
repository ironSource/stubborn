var _ = require('lodash');
var debug = require('debug');
var events = require('events');
var onlyOnce = require('only-once');
var util = require('util');

var EventEmitter = events.EventEmitter;

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
	var maxAttemps = options.maxAttemps;
	this._maxAttemps = _.isUndefined(maxAttemps) ? 10 : maxAttemps;
	var delay = options.delay;
	this._delay = _.isUndefined(delay) ? 100 : delay;
	this._delayProgression = options.delayProgression;
	this._callback = callback;
	this._attempt = 0;
	this._rerunBound = _.bind(this._rerun, this);
	this._onTaskExecutedBound = _.bind(this._onTaskExecuted, this);
}

var p = Stubborn.prototype;

p.run = function() {
	this._debug('run');
	this.emit('run', this._attempt++);
	try {
		var onTaskExecuted = onlyOnce(this._onTaskExecutedBound);
		this._task(onTaskExecuted);
	} catch(e) {
		this._onTaskExecuted(e);
	}
};

p._rerun = function() {
	this._debug('_rerun');
	this.run();
};

p._onTaskExecuted = function(err) {
	this._debug('_onTaskExecuted');
	if (err === undefined || err === null) {
		this._callback(err);
		return;
	}
	this.emit('error', err);
	var attempt = this._attempt;
	if (attempt >= this._maxAttemps) {
		var err = new Error('Max attempts reached');
		this._callback(err);
		return;
	}
	var delay = this._delay;
	if (this._delayProgression) {
		var factor = this._delayProgression(attempt);
		delay = delay * factor;
	}
	this.emit('schedule', delay, attempt);
	this._setTimeout(this._rerunBound, delay);
};

delete p;

module.exports = Stubborn;
