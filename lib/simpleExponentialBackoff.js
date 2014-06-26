/*
	a simple retries^exponent backoff calculation
*/
module.exports = function (exponent) {
	
	if (exponent === undefined) exponent = 2;

	return function simpleExponentialBackoff(retries) {

		return Math.pow(exponent, retries);
	};
};