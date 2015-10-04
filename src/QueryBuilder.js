class QueryBuilder {
	constructor() {
		this.reset();
	}

	reset() {
		this.$$filters = [];

		this.$$pagination = {
			page: 1,
			limit: QueryBuilder.DEFAULT_PAGE_SIZE,
			skip: 0
		};

		this.$$sorting = [];
	}

	sort(field, reverse) {
		let direction = reverse ? 'desc' : 'asc';
		let rule = [field, direction];

		this.$$sorting.push(rule);
		return this;
	}

	addFilter(name, operator, value) {
		let found = this.$$filters.some(function (item) {
			if (name === item.name && operator === item.operator) {
				item.value = value;
				return true;
			}
		});

		if (!found) {
			let filter = {
				name, operator, value
			};

			this.$$filters.push(filter);
		}
	}

	where(field) {
		return QueryBuilderOperators.create(this, field);
	}

	page(pageNumber) {
		this.$$pagination.page = Number(pageNumber);
		return this;
	}

	skip(count) {
		this.$$pagination.skip = Number(count);
		return this;
	}

	limit(pageSize) {
		this.$$pagination.limit = Number(pageSize);
		return this;
	}

	toJSON() {
		let mapper = function(item) { return { name: item.name, operator: item.operator, value: item.value }; };
		return this.serialize(mapper);
	}

	toJSONArray() {
		let mapper = function(item) { return [ item.name, item.operator, item.value ]; };
		return this.serialize(mapper);
	}

	serialize(mapper) {
		let pagination = this.$$pagination;
		let filters = this.$$filters.map(mapper);
		let sorting = [];

		this.$$sorting.forEach((item) => sorting.push([ item[0], item[1] ]));

		return {
			filters,
			sorting,
			page: pagination.page,
			skip: pagination.skip,
			limit: pagination.limit
		};
	}

	static create() {
		return new QueryBuilder();
	}
}

QueryBuilder.DEFAULT_PAGE_SIZE = 20;

class QueryBuilderOperators {
	constructor(query, field) {
		this.$$query = query;
		this.$$field = field;
	}

	static create(query, field) {
		return new QueryBuilderOperators(query, field);
	}

	static add(name, symbol) {
		let prototype = QueryBuilderOperators.prototype;

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
}

// Built-in operators:
// lt, lte, gt, gte, in, eq, ne, like, st, end
let builtinOperators = {
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

Object.keys(builtinOperators).forEach(function(name) {
	let symbol = builtinOperators[name];
	QueryBuilderOperators.add(name, symbol);
});