"use strict";
/*jshint smarttabs: true */

/*
* @TODO add JSDOC
* @TODO add JSON handling
* @TODO add better error handling
* */

var fs      = require('fs');
var path    = require('path');
var async   = require('async');
var csv     = require('csv');
var _       = require('underscore');
var chalk   = require('chalk');
var mkdirp  = require("mkdirp");



var FileCloner = function FileCloner(args) {
	var _this = this;

	_this.files = {
		src  : 'index.html',
		vars : "vars.csv"
	};

	_this.paths = {
		src  : './',
		dest : './clones/'
	};

	/* source file contents */
	_this.src = '';

	/* mustache needles and replacers */
	_this.vars = {
		needles   : [],
		replacers : []
	};

	this.init(args);
};




FileCloner.prototype.init = function (args) {
	var _this = this;

	async.series(
		[
			function (cb) {
				_this.parseArgs(args, cb, 'parsing arguments');

			},

			function (cb) {
				_this.parseSources(cb, 'parsing sources');

			},

			function (cb) {
				_this.ensureDestinationPath(cb, 'setting destination paths');

			},

			function (cb) {
				_this.generateCollection(cb, 'generating clones');

			}

		],

		function (err, results) {
			if (err) {
				return console.error(err);
			}

			console.log('');
			console.log(chalk.white.bgGreen.bold('All files have been processed successfully. Partey!'));
		}

	);

};







FileCloner.prototype.parseArgs = function(args, callback) {
	var _this = this;

	if(args !== null && typeof args === 'object'){

		if(args._.length > 0){
			if(typeof args._[0] !== "undefined" && args._[0].length > 5){
				_this.files.src = args._[0];
			}

			if(typeof args._[1] !== "undefined" && args._[1].length > 4){
				_this.files.vars = args._[1];
			}

			if(typeof args._[2] !== "undefined" && args._[2].length){
				_this.paths.dest = args._[2];
			}

		}else{

			if (typeof args.s!== "undefined" &&  args.s.length > 5) {
				_this.files.src = args.s;
			}

			if (typeof args.m !== "undefined" && args.m.length > 4) {
				_this.files.vars = args.m;
			}

			if (typeof args.d !== "undefined" && args.d.length) {
				_this.paths.dest = args.d;
			}
		}

	}

	callback();
};




FileCloner.prototype.parseSources = function(callback){
	var _this = this;


	async.forEachOf(
		_this.files, function (filename, key, inner_callback) {


			fs.readFile(
				path.join(_this.paths.src, filename), "utf8", function (err, data) {
					if (err) return inner_callback(err);

						if (key === 'vars') {

							/* parse csv */
							if (filename.toLowerCase().substr(-4) === '.csv') {

								_this.parseCsv(data, inner_callback);

							} else if (filename.toLowerCase().substr(-5) === '.json') {
								_this.vars = JSON.parse(data);
								inner_callback();
							}

						} else {
							_this.src = data;
							inner_callback();
						}

				}
			)
		}, function (err, result) {
			if (err) {
				console.log(chalk.bgRed.bold(" shit assploded! Couldn't read the source file."));
				return console.error(err.message);
			}

			callback();
		}
	);

};







FileCloner.prototype.parseCsv = function(data, callback){
	var _this = this,
			_output = {};


	csv.parse(
		data,
		{comment : '#'},
		function (err, output) {


			_output = {
				needles   : output[0],
				replacers : output.slice(1)
			};

			_this.vars =  _output;

			if (Array.isArray(_output.replacers) && _output.replacers.length>0) {
				callback();

			} else {
				console.log(chalk.bgRed.bold(" shit assploded! Couldn't read the csv file."));
				process.exit();

			}
		}
	);

};






FileCloner.prototype.ensureDestinationPath = function (callback) {
	var _this = this;

	mkdirp(
		_this.paths.dest, function (err) {
			if (err) {
				return console.error(err.message);
			}

			callback();
		}
	);

};




FileCloner.prototype.generateCollection = function (callback) {
	var _this = this;

	async.each(
		_this.vars.replacers, function (collection, callback) {
			var _destFilename = _this.files.src.split('.html').join('.' + collection[0] + '.html');

			fs.writeFile(
				path.join(_this.paths.dest, _destFilename),
				_this.replaceVars(_this.src, collection),

				function (err) {
					if (err) {
						return console.error(err.message);
					}

					console.log(chalk.magenta.bold(_destFilename.substr(1)) + " was created.");
					callback();
				}
			);


		}, function (err) {
			if (err) {
				return console.error(err.message);
			}
			else {
				callback();
			}
		}
	);

};




FileCloner.prototype.replaceVars = function (str, collection) {
	var _this = this,
	    _output = str;

	_.each(
		_this.vars.needles, function (needle, index) {
			_output = _output.split('{{' + needle + '}}').join(collection[index]);
		}
	);

	return _output;
};




module.exports = FileCloner;