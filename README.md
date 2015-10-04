## QueryBuilder

This is a generic search query builder. Its intent is to provide a standarized interface to build search queries, like those used in ORM systems or data layers like Hybernate, Doctrine or LINQ.

Its syntax can be extended to add custom operators while keeping the same interface idea. Besides the search parameters, there is also a set of methods to add pagination information and sorting fields.

## Built in operators

A query instance comes with these common operators:

`LT, LTE, GT, GTE, IN, EQ, NE, LK, ST, END`

The names are short versions of very common operations, such as `less than`, `less than or equal` and `like`.

## Production status

Not there yet.

## Sample code

```
var search = QueryBuilder.create()

	.where('name').eq('john')
	.where('age').gt(30)
	.where('interests').in(['travel', 'food', 'sports'])

	.skip(30)				// skip first 30 results
	.limit(20)				// limit to 20 items

	.sortBy('-name');		// descending order
```

## Build

```
npm install
make install
make build
```

