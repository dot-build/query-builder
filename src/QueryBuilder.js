class QueryBuilder {
	constructor() {
		this.$$filters = [];
	}

	add(name, operator, value) {
		let filter = {
			name, operator, value
		};

		this.$$filters.push(filter);
	}

	where(field) {
		return QueryBuilderOperators.create(this, field);
	}

	static create() {
		return new QueryBuilder();
	}
}

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
			this.$$query.add(this.$$field, symbol, value);
			return this.$$query;
		}
	}
}

// Built-in operators:
// lt, lte, gt, gte, in, eq, ne, lk, st, end
let builtinOperators = {
	'lt'	: '<',
	'lte'	: '<=',
	'gt'	: '>',
	'gte'	: '>=',
	'in'	: 'in',
	'eq'	: '=',
	'ne'	: '!=',
	'lk'	: '~',
	'st'	: '^',
	'end'	: '$'
};

Object.keys(builtinOperators).forEach(function (name) {
	let symbol = builtinOperators[name];
	QueryBuilderOperators.add(name, symbol);
});

/*
function skip(skipValue) {
	this.$$pagination.goToPage(~~(skipValue / this.$$pagination.itemsPerPage) + 1);
	return this;
}

function limit(limitValue) {
	this.$$pagination.setState({
		itemsPerPage: limitValue
	});
	return this;
}

function page(pageNumber, limit) {
	this.$$pagination.goToPage(pageNumber, limit);
	return this;
}
*/
