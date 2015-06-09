"use strict";
/*jshint smarttabs: true */


var fs      = require('fs');
var path    = require('path');
var process = require('process');
var async   = require('async');
var csv     = require('csv');
var _       = require('underscore');
var chalk   = require('chalk');
var mkdirp  = require("mkdirp");



var FileCloner = function FileCloner(name) {
	var _this = this;

	_this.files = {
		vars : "vars.csv",
		src  : 'index-full.html'
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

	this.init();
};




FileCloner.prototype.init = function () {

	async.series(
		[
			function (callback) {
				parseSources(callback, 'parsing sources');
			},

			function (callback) {
				ensureDestinationPath(callback, 'setting destination paths');
			},

			function (callback) {
				generateCollection(callback, 'generating clones');
			}

		]
	);

};



FileCloner.prototype.parseSources = function(callback){
	var _this = this;

	async.forEachOf(
		_this.files, function (value, key, callback) {


			fs.readFile(
				path.join(_this.paths.src, value), "utf8", function (err, data) {
					if (err) return callback(err);

					try {

						if (key === 'vars') {

							/* parse csv */
							if (value.toLowerCase().substr(-4) === '.csv') {
								_this.vars = _this.parseCsv(data);

							} else if (value.toLowerCase().substr(-5) === '.json') {
								_this.vars = JSON.parse(data);
							}

						} else {
							_this.src = data;
						}


					} catch (e) {
						return callback(e);
					}
					callback();
				}
			)
		}, function (err) {
			if (err) console.error(err.message);


		}
	);
};







FileCloner.prototype.parseCsv = function(data){
	var _this = this,
			_output = {};

	csv.parse(
		data,
		{comment : '#'},
		function (err, output) {
			_output = {
				needles   : output[0],
				replacers : output.slice(1)
			}
		}
	);

	if(Array.isArray(_output)){
		return _output;

	}else{
		console.log(chalk.bgRed.bold(" shit assploded! Couldn't read the csv file."));
		process.exit();

	}

};




/*


var processFiles = function(){
	var _this = this;
  async.series([
    function(callback){
        // do some stuff ...
	    _this.ensureDestinationPath(callback, 'mkdiring');
    },
    function(callback){
        // do some more stuff ...
        generateCollection(callback, 'generating');
    }
  ], 

  function(err, results){
      if (err){ return console.error(err); }

      console.log('');
      console.log( chalk.white.bgGreen.bold('All files have been processed successfully. Partey!') );
  });
};
*/




FileCloner.prototype.ensureDestinationPath = function(callback){
	var _this = this;

  mkdirp(_this.paths.dest, function (err) {
      if (err){ return console.error(err); }
      
      callback();
  });

};




FileCloner.prototype.generateCollection = function (callback) {
	var _this = this;

	async.each(
		_this.vars.replacers, function (collection, callback) {
			var _destFilename = _this.files.src.split('.html').join('.' + collection[0] + '.html');

			fs.writeFile(
				path.join(_this.paths.dest, _destFilename),
				replaceVars(_this.src, collection),

				function (err) {
					if (err) {
						return console.error(err);
					}

					console.log(chalk.magenta.bold(_destFilename.substr(1)) + " was created.")
					callback();
				}
			);


		}, function (err) {
			if (err) {
				return console.error(err);
			}
			else {
				callback();
			}
		}
	);

};




FileCloner.prototype.replaceVars = function(str, collection){
  var _this   = this,
      _output = str;

  _.each(
	  _this.vars.needles, function(needle, index){
    _output = _output.split('{{' + needle + '}}').join(collection[index]);
  });

  return _output;
};




module.exports = FileCloner;