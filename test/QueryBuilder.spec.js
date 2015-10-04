/* globals QueryBuilder, QueryBuilderOperators */
describe('QueryBuilder', function() {
	'use strict';

	describe('#constructor()', function() {
		it('should initialize the instance', function() {
			var instance = QueryBuilder.create();

			var pagination = {
				page: 1,
				limit: 20,
				skip: 0
			};

			var sorting = [];

			expect(instance.$$filters).toEqual([]);
			expect(instance.$$pagination).toEqual(pagination);
			expect(instance.$$sorting).toEqual(sorting);
		});
	});

	describe('::DEFAULT_PAGE_SIZE', function() {
		it('should have a default page size', function() {
			expect(QueryBuilder.DEFAULT_PAGE_SIZE).toBe(20);
		});
	});

	describe('::create()', function() {
		it('should return a instance of QueryBuilder', function() {
			expect(QueryBuilder.create() instanceof QueryBuilder).toBe(true);
		});
	});

	describe('#addFilter(filter, operator, value)', function() {
		it('should add a filter to the query', function() {
			var query = QueryBuilder.create();
			query.addFilter('foo', '=', 123);

			expect(query.$$filters).toEqual([{
				name: 'foo',
				operator: '=',
				value: 123
			}]);
		});

		it('should replace a filter value if name and operator are repeated', function () {
			var query = QueryBuilder.create();
			query.addFilter('foo', '=', 123);
			query.addFilter('foo', '=', 567);

			expect(query.$$filters).toEqual([{
				name: 'foo',
				operator: '=',
				value: 567
			}]);
		});
	});

	describe('#where(String field)', function() {
		/**
		 * Idea around the method:
		 *
		 * 		.where('field_name') => new instance of QueryBuilderOperators
		 * 		.eq('filter value') => returns the QueryBuilder instance from where()
		 *
		 * 		.where('other_field') => new instance of QueryBuilderOperators
		 * 		.gte(23) => returns the QueryBuilder instance from where()
		 */
		it('should return an instance of QueryBuilderOperators to chain calls', function() {
			var instance = QueryBuilder.create();
			var chain = instance.where('field');

			expect(chain instanceof QueryBuilderOperators).toBe(true);

		});
	});

	describe('#sort(String field, Boolean descending)', function() {
		/**
		 * Idea:
		 * 		#sort(field, reverse)
		 *
		 * 		.sort('name') 			=> sort by name
		 * 		.sort('age', true)		=> sort by name, reverse order
		 *
		 */
		it('should add a sorting rule ascending', function() {
			var instance = QueryBuilder.create();
			var chain = instance.sort('field');

			instance.sort('other');

			// chained calls
			expect(chain).toBe(instance);

			expect(instance.$$sorting).toEqual([
				['field', 'asc'],
				['other', 'asc'],
			]);
		});

		it('should add a sorting rule descending', function() {
			var instance = QueryBuilder.create();
			var chain = instance.sort('field', true);

			instance.sort('other', true);

			// chained calls
			expect(chain).toBe(instance);

			expect(instance.$$sorting).toEqual([
				['field', 'desc'],
				['other', 'desc'],
			]);
		});
	});

	describe('#reset()', function() {
		it('should clean up all the sorting and filtering rules and reset pagination', function () {
			var query = QueryBuilder.create()
				.where('name').eq('John')
				.where('age').gt(30)
				.sort('name')
				.page(2)
				.limit(30)
				.skip(20);

			query.reset();

			var pagination = {
				page: 1,
				limit: 20,
				skip: 0
			};

			var sorting = [];
			var filters = [];

			expect(query.$$filters).toEqual(filters);
			expect(query.$$pagination).toEqual(pagination);
			expect(query.$$sorting).toEqual(sorting);
		});
	});

	describe('#limit(Number pageSize)', function() {
		it('should set the page size', function() {
			var query = QueryBuilder.create();
			var result = query.limit(35);

			expect(query.$$pagination.limit).toBe(35);
			expect(result).toBe(query);
		});
	});

	describe('#page(Number page)', function() {
		it('should set the page size', function() {
			var query = QueryBuilder.create();
			var result = query.page(2);

			expect(query.$$pagination.page).toBe(2);
			expect(result).toBe(query);
		});
	});

	describe('#skip(Number skip)', function() {
		it('should set the page size', function() {
			var query = QueryBuilder.create();
			var result = query.skip(12);

			expect(query.$$pagination.skip).toBe(12);
			expect(result).toBe(query);
		});
	});

	describe('#toJSON()', function() {
		it('should return a JSON structure with the filters, pagination and sorting', function() {
			// all filters:
			// lt, lte, gt, gte, in, eq, ne, like, st, end

			var query = QueryBuilder.create()
				.where('firstName').eq('John')
				.where('age_start').gte(20)
				.where('age_end').lte(50)
				.where('birthday').lt('date-1')
				.where('birthday').gt('date-2')
				.where('interests').in(['travel', 'sports'])
				.where('active').ne(false)
				.where('lastName').like('Doe')
				.where('firsName').st('J')
				.where('firsName').end('n')
				.sort('name')
				.sort('age', true)
				.skip(15)
				.limit(25)
				.page(2);

			var result = query.toJSON();

			var expectedJSON = {
				'filters': [{
					'name': 'firstName',
					'operator': '=',
					'value': 'John'
				}, {
					'name': 'age_start',
					'operator': '>=',
					'value': 20
				}, {
					'name': 'age_end',
					'operator': '<=',
					'value': 50
				}, {
					'name': 'birthday',
					'operator': '<',
					'value': 'date-1'
				}, {
					'name': 'birthday',
					'operator': '>',
					'value': 'date-2'
				}, {
					'name': 'interests',
					'operator': 'in',
					'value': [
						'travel',
						'sports'
					]
				}, {
					'name': 'active',
					'operator': '!=',
					'value': false
				}, {
					'name': 'lastName',
					'operator': '~',
					'value': 'Doe'
				}, {
					'name': 'firsName',
					'operator': '^',
					'value': 'J'
				}, {
					'name': 'firsName',
					'operator': '$',
					'value': 'n'
				}],
				'sorting': [
					['name', 'asc'],
					['age', 'desc']
				],
				'page': 2,
				'skip': 15,
				'limit': 25
			};

			expect(result).toEqual(expectedJSON);
		});
	});

	describe('#toJSONArray()', function() {
		it('should return a JSON structure with the filters, pagination and sorting as a multidimensional array', function() {
			var query = QueryBuilder.create()
				.where('firstName').eq('John')
				.where('age_start').gte(20)
				.where('age_end').lte(50)
				.where('birthday').lt('date-1')
				.where('birthday').gt('date-2')
				.where('interests').in(['travel', 'sports'])
				.where('active').ne(false)
				.where('lastName').like('Doe')
				.where('firsName').st('J')
				.where('firsName').end('n')
				.sort('name')
				.sort('age', true)
				.skip(15)
				.limit(25)
				.page(2);

			var result = query.toJSONArray();

			var expectedJSON = {
				'filters': [
					['firstName', '=', 'John'],
					['age_start', '>=', 20],
					['age_end', '<=', 50],
					['birthday', '<', 'date-1'],
					['birthday', '>', 'date-2'],
					['interests', 'in', ['travel', 'sports']],
					['active', '!=', false],
					['lastName', '~', 'Doe'],
					['firsName', '^', 'J'],
					['firsName', '$', 'n']
				],
				'sorting': [
					['name', 'asc'],
					['age', 'desc']
				],
				'page': 2,
				'skip': 15,
				'limit': 25
			};

			expect(result).toEqual(expectedJSON);
		});
	});


});

/**
 * A base class to all query operators
 *
 * Idea:
 *		QueryBuilderOperators.add('operator_name', 'operator_value')
 */
describe('QueryBuilderOperators', function() {
	'use strict';

	describe('#constructor(QueryBuilder query, String fieldName)', function() {
		it('should store the query builder instance', function() {
			var query = new QueryBuilder();
			var chain = new QueryBuilderOperators(query, 'field_name');

			expect(chain.$$query).toBe(query);
			expect(chain.$$field).toBe('field_name');
		});
	});

	describe('::create(QueryBuilder query, String fieldName)', function() {
		it('should create and return an instance of QueryBuilderOperators', function() {
			var query = QueryBuilder.create();
			var chain = QueryBuilderOperators.create(query, 'foo');

			expect(chain instanceof QueryBuilderOperators).toBe(true);
		});
	});

	describe('::add(String name, String operator)', function() {
		it('should add an operator function that applies the filter value to a query and returns it', function() {
			var operatorName = 'foo';
			var operatorSymbol = '>>';

			QueryBuilderOperators.add(operatorName, operatorSymbol);

			var operatorFn = QueryBuilderOperators.prototype.foo;
			expect(typeof operatorFn).toBe('function');

			var filterName = 'foo';
			var filterValue = '123';

			var query = QueryBuilder.create();
			spyOn(query, 'addFilter');

			var chain = QueryBuilderOperators.create(query, filterName);

			// a method with the operator name
			var result = chain.foo(filterValue);

			expect(query.addFilter).toHaveBeenCalledWith(filterName, operatorSymbol, filterValue);
			expect(result).toBe(query);

			delete QueryBuilderOperators.prototype.foo;
		});

		it('should throw an error if a filter already exists', function() {
			function test() {
				var operatorName = 'repeat',
					operatorSymbol = '--';
				QueryBuilderOperators.add(operatorName, operatorSymbol);
			}

			// registers once
			test();

			expect(test).toThrow(new Error('Operator already exists: repeat'));
		});
	});

	describe('built in filters', function() {
		it('should have all the built in filters registered', function() {
			// builtin filters
			var expectedFilters = ['lt', 'lte', 'gt', 'gte', 'in', 'eq', 'ne', 'like', 'st', 'end'];

			expectedFilters.forEach(function(filter) {
				expect(typeof QueryBuilderOperators.prototype[filter]).toBe('function');
			});
		});
	});
});
