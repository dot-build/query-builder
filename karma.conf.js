/* jshint node: true */
module.exports = function(config) {
	'use strict';

	var babelOptions = require(__dirname + '/babel-options.js');

	config.set({
		browsers: ['PhantomJS'],
		frameworks: ['jasmine'],
		files: [
			'bower_components/evt/dist/EventEmitter.js',
			'bower_components/es6-collections/es6-collections.js',
			'src/QueryBuilder.js',
			'src/Query*.js',
			'test/*.spec.js'
		],
		preprocessors: {
			'src/*.js': ['babel']
		},
		babelPreprocessor: {
			options: babelOptions
		}
	});
};
