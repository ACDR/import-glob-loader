/* vim: set ts=4 sw=4 noet: */
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports['default'] = importGlob;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _loaderUtils = require('loader-utils');

var _loaderUtils2 = _interopRequireDefault(_loaderUtils);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var quotedString = /(['"])(.*?)\1/;
var trailingSlash = /\/$/;

function importGlob(source) {
	this.cacheable();
	var options = _loaderUtils2['default'].parseQuery(this.query);
	options.sync = true;

	var _options$test = options.test;
	var test = _options$test === undefined ? "import" : _options$test;
	var _options$delimiter = options.delimiter;
	var delimiter = _options$delimiter === undefined ? '\n' : _options$delimiter;

	var qualifier = /import {[^;]+}.*?(\'.*?\*');/gm;

	function expandGlob(result) {
		var _this = this;

		if (!result) return;

		var _result = _slicedToArray(result, 3);

		var match = _result[0];
		var quote = _result[1];
		var content = _result[2];

		var offset = result.index;
		var line = result.input;

		if (!_glob2['default'].hasMagic(content)) return;

		var pre = line.slice(0, offset);

		var names = pre.slice(pre.indexOf("{") + 1, pre.indexOf("}"));
		names = names.replace(/\s/g, '');
		names = names.split(',');
		names = names.sort();

		options.cwd = this.context;
		var dirGlob = new _glob2['default'].Glob(trailingSlash.test(content) ? content : content + '/', options);

		dirGlob.found.forEach(function (directory) {
			return _this.addContextDependency(directory);
		});

		var fileOptions = Object.create(options);
		if (!options.hasOwnProperty('nodir')) {
			fileOptions.nodir = true;
		}
		fileOptions.cwd = this.context;
		fileOptions.cache = dirGlob.cache;
		fileOptions.statCache = dirGlob.statCache;

		return _glob2['default'].sync(content, options).map(function (filename, index) {
			if (!names[index] || names[index].indexOf('//') > -1) {
				return '';
			}

			return 'import ' + names[index] + ' from ' + quote + filename + quote + ';';
		}).join(delimiter);
	}

	function expandLine(line, payload) {
		if (!(payload && payload.trim())) return line;
		return expandGlob.call(this, quotedString.exec(line)) || line;
	}

	return source.replace(qualifier, expandLine.bind(this));
}

module.exports = exports['default'];
