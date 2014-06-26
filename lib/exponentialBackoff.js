function random(start, end) {
    var range = end - start;
    return Math.floor((Math.random() * range) + start);
}

/*
	Exponential backoff: http://en.wikipedia.org/wiki/Exponential_backoff
*/
module.exports = function(exponent) {
	
	if (exponent === undefined) exponent = 2;

	return function exponentialBackoff(retries) {

		// wait anywhere between zero to 2^retries inclusive (hence +1)
		return random(0, Math.pow(exponent, retries) + 1);
	};
};