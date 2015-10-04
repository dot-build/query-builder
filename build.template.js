(function(global) {
	'use strict';

	/* content goes here */

	if (typeof define === 'function' && define.amd) {
		define(function() {
			return QueryBuilder;
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = QueryBuilder;
	} else {
		global.QueryBuilder = QueryBuilder;
	}

})(this);
