/*
	ax + b linear function with defaults
*/
module.exports = function (a, b) {
	
	if (a === undefined) a = 1;
	if (b === undefined) b = 0;

	return function linear(attempts) {
		return a * attempts + b;
	};
};