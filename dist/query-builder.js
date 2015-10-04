(function(global) {
	'use strict';

	'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var QueryBuilder = (function () {
	function QueryBuilder() {
		_classCallCheck(this, QueryBuilder);

		this.reset();
	}

	_createClass(QueryBuilder, [{
		key: 'reset',
		value: function reset() {
			this.$$filters = [];

			this.$$pagination = {
				page: 1,
				limit: QueryBuilder.DEFAULT_PAGE_SIZE,
				skip: 0
			};

			this.$$sorting = [];
		}
	}, {
		key: 'sort',
		value: function sort(field, reverse) {
			var direction = reverse ? 'desc' : 'asc';
			var rule = [field, direction];

			this.$$sorting.push(rule);
			return this;
		}
	}, {
		key: 'addFilter',
		value: function addFilter(name, operator, value) {
			var found = this.$$filters.some(function (item) {
				if (name === item.name && operator === item.operator) {
					item.value = value;
					return true;
				}
			});

			if (!found) {
				var filter = {
					name: name, operator: operator, value: value
				};

				this.$$filters.push(filter);
			}
		}
	}, {
		key: 'where',
		value: function where(field) {
			return QueryBuilderOperators.create(this, field);
		}
	}, {
		key: 'page',
		value: function page(pageNumber) {
			this.$$pagination.page = Number(pageNumber);
			return this;
		}
	}, {
		key: 'skip',
		value: function skip(count) {
			this.$$pagination.skip = Number(count);
			return this;
		}
	}, {
		key: 'limit',
		value: function limit(pageSize) {
			this.$$pagination.limit = Number(pageSize);
			return this;
		}
	}, {
		key: 'toJSON',
		value: function toJSON() {
			var mapper = function mapper(item) {
				return { name: item.name, operator: item.operator, value: item.value };
			};
			return this.serialize(mapper);
		}
	}, {
		key: 'toJSONArray',
		value: function toJSONArray() {
			var mapper = function mapper(item) {
				return [item.name, item.operator, item.value];
			};
			return this.serialize(mapper);
		}
	}, {
		key: 'serialize',
		value: function serialize(mapper) {
			var pagination = this.$$pagination;
			var filters = this.$$filters.map(mapper);
			var sorting = [];

			this.$$sorting.forEach(function (item) {
				return sorting.push([item[0], item[1]]);
			});

			return {
				filters: filters,
				sorting: sorting,
				page: pagination.page,
				skip: pagination.skip,
				limit: pagination.limit
			};
		}
	}], [{
		key: 'create',
		value: function create() {
			return new QueryBuilder();
		}
	}]);

	return QueryBuilder;
})();

QueryBuilder.DEFAULT_PAGE_SIZE = 20;

var QueryBuilderOperators = (function () {
	function QueryBuilderOperators(query, field) {
		_classCallCheck(this, QueryBuilderOperators);

		this.$$query = query;
		this.$$field = field;
	}

	// Built-in operators:
	// lt, lte, gt, gte, in, eq, ne, like, st, end

	_createClass(QueryBuilderOperators, null, [{
		key: 'create',
		value: function create(query, field) {
			return new QueryBuilderOperators(query, field);
		}
	}, {
		key: 'add',
		value: function add(name, symbol) {
			var prototype = QueryBuilderOperators.prototype;

			if (name in prototype) {
				throw new Error('Operator already exists: ' + name);
			}

			prototype[name] = operatorFunction;

			/* jshint validthis: true */
			function operatorFunction(value) {
				this.$$query.addFilter(this.$$field, symbol, value);
				return this.$$query;
			}
		}
	}]);

	return QueryBuilderOperators;
})();

var builtinOperators = {
	'lt': '<',
	'lte': '<=',
	'gt': '>',
	'gte': '>=',
	'in': 'in',
	'eq': '=',
	'ne': '!=',
	'like': '~',
	'st': '^',
	'end': '$'
};

Object.keys(builtinOperators).forEach(function (name) {
	var symbol = builtinOperators[name];
	QueryBuilderOperators.add(name, symbol);
});

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