var exponentialBackoff = require('./exponentialBackoff.js');
var simpleExponentialBackoff = require('./simpleExponentialBackoff.js');
var logarithmicProgression = require('./exponentialBackoff.js');
var linear = require('./linear.js');
var constant = require('./constant.js');

module.exports = function(name) {
	if (name === 'exponentialBackoff')
		return exponentialBackoff;

	if (name === 'simpleExponentialBackoff')
		return simpleExponentialBackoff;

	if (name === 'linear')
		return linear;

	if (name === 'logarithmicProgression')
		return logarithmicProgression;

	if (name === 'constant')
		return constant;

	throw new Error('unknown retry algorithm: ' + name)
}