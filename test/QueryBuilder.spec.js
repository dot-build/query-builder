/* globals QueryBuilder, QueryBuilderOperators */
describe('QueryBuilder', function() {
	'use strict';

	describe('#constructor()', function() {
		it('should initialize the instance', function () {
			var instance = QueryBuilder.create();
			expect(instance.$$filters).toEqual([]);
		});
	});

	describe('::create()', function() {
		it('should return a instance of QueryBuilder', function() {
			expect(QueryBuilder.create() instanceof QueryBuilder).toBe(true);
		});
	});

	describe('#add(filter, operator, value)', function() {
		it('should add a filter to the query', function() {
			var query = QueryBuilder.create();
			query.add('foo', '=', 123);

			expect(query.$$filters).toEqual([{
				name: 'foo',
				operator: '=',
				value: 123
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
		it('should create and return an instance of QueryBuilderOperators', function () {
			var query = QueryBuilder.create();
			var chain = QueryBuilderOperators.create(query, 'foo');

			expect(chain instanceof QueryBuilderOperators).toBe(true);
		});
	});

	describe('::add(String name, String operator)', function() {
		it('should add an operator function that applies the filter value to a query and returns it', function() {
			var operatorName = 'foo';
			var operatorSymbol ='>>';

			QueryBuilderOperators.add(operatorName, operatorSymbol);

			var operatorFn = QueryBuilderOperators.prototype.foo;
			expect(typeof operatorFn).toBe('function');

			var filterName = 'foo';
			var filterValue = '123';

			var query = QueryBuilder.create();
			spyOn(query, 'add');

			var chain = QueryBuilderOperators.create(query, filterName);

			// a method with the operator name
			var result = chain.foo(filterValue);

			expect(query.add).toHaveBeenCalledWith(filterName, operatorSymbol, filterValue);
			expect(result).toBe(query);

			delete QueryBuilderOperators.prototype.foo;
		});

		it('should throw an error if a filter already exists', function () {
			function test () {
				var operatorName = 'repeat', operatorSymbol = '--';
				QueryBuilderOperators.add(operatorName, operatorSymbol);
			}

			// registers once
			test();

			expect(test).toThrow(new Error('Operator already exists: repeat'));
		});
	});

	describe('built in filters', function() {
		it('should have all the built in filters registered', function () {
			// builtin filters
			var expectedFilters = ['lt', 'lte', 'gt', 'gte', 'in', 'eq', 'ne', 'lk', 'st', 'end'];

			expectedFilters.forEach(function (filter) {
				expect(typeof QueryBuilderOperators.prototype[filter]).toBe('function');
			});
		});
	});
});
