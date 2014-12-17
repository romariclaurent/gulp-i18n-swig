var through = require('through2');
var swig = require('swig');
var clone = require('clone');
var gutil = require('gulp-util');
var ext = gutil.replaceExtension;
var PluginError = gutil.PluginError;
var fs = require('fs');
var path = require('path');
var File = gutil.File;
var Polyglot = require("node-polyglot");
var translaters = {};

function render(template, locale, translations, data){
	var polyglot = new Polyglot();
	polyglot.extend(translations[locale]);

	swig.setFilter('t', function (input, idx) {
	  return polyglot.t.call(polyglot, input);
	});
	data.locale = locale;
	return swig.render(String(template.contents), { filename: template.path, locals: data } );

}

function extname(filepath){ 
	var filename = path.basename(filepath);
	return filename.substr(filename.indexOf("."), filename.length);
}

function rename(filepath, local){
	var extension = path.extname(filepath);
	return filepath.substr(0, filepath.indexOf(".")) + "-" + local + extension;
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

				if (options.defaultLocale == local){
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
			// callback();
		}
	}

	return through.obj(gulpswig);
};
