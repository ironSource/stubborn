module.exports = function (c) {

	return function constant(attempts) {
		return c;
	};
};