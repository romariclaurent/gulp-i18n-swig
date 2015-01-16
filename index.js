'use strict';

var through = require('through2');
var swig = require('swig');
var clone = require('clone');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var path = require('path');
var File = gutil.File;
var Polyglot = require('node-polyglot');

function render(template, locale, translations, data) {
	var polyglot = new Polyglot();
	polyglot.extend(translations[locale]);

	swig.setFilter('t', function (input) {
		return polyglot.t.call(polyglot, input);
	});
	data.locale = locale;
	return swig.render(String(template.contents), { filename: template.path, locals: data } );

}

function rename(filepath, local){
	var dirname = path.dirname(filepath);
	var extension = path.extname(filepath);
	var filename = path.basename(filepath, extension);
	filename = filename.substr(0, filename.lastIndexOf('.'));
	return dirname + '/' + filename + '-' + local + extension;
}

module.exports = function(options) {
	
	var opts = options ? clone(options) : {};
	var translations = opts.translations || {};
	var data = options.data;

	swig.setDefaults({ cache: false, varControls: ['{@', '@}'] });
	
	if (opts.defaults) {
		swig.setDefaults(opts.defaults);
	}

	if (opts.setup && typeof opts.setup === 'function') {
		opts.setup(swig);
	}

	function gulpswig(file, enc, callback) {

		/*jshint validthis: true */
		var stream = this;
		
		try {

			for (var local in translations){
				var rendered = render(file, local, translations, data);
				
				stream.push(new File({
					cwd: file.cwd,
					base: file.base,
					path: rename(file.path, local),
					contents: new Buffer(rendered)
				}));

				if (options.defaultLocale === local){
					stream.push(new File({
						cwd: file.cwd,
						base: file.base,
						path: file.path,
						contents: new Buffer(rendered)
					}));
				}
			}

			callback();

		} catch (err) {
			console.log(err);
			callback(new PluginError('gulp-swig', err));
		}
	}

	return through.obj(gulpswig);
};
