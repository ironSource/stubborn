module.exports = require('./lib/Stubborn.js');
module.exports.exponentialBackoff = require('./lib/exponentialBackoff.js');
module.exports.simpleExponentialBackoff = require('./lib/simpleExponentialBackoff.js');
module.exports.logarithmicProgression = require('./lib/exponentialBackoff.js');
module.exports.linear = require('./lib/linear.js');
module.exports.constant = require('./lib/constant.js');
module.exports.retryAlgorithm = require('./lib/retryAlgorithm.js')