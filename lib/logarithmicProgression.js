/*
	log b (x) + 1
*/
module.exports = function (base) {
	if (base === undefined) base = 2;

	return function(retries) {
		return Math.floor( Math.log(retries) / Math.log(base) ) + 1;
	};
};