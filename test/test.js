'use strict';

var fs = require('fs');
var gulp = require('gulp');
var assert = require('assert');
var Q = require('q');

var i18nSwig = require('../index.js');

var readFileOptions = {encoding: 'utf-8'};

describe('gulp-i18n-swig', function() {
  var outputFolder = __dirname + '/output/';
  var localesPath = __dirname + '/fixtures/locales.json';
  var locales = JSON.parse(fs.readFileSync(localesPath));

  function doLeTest(input, path, locale, doneCb) {
    var stream = gulp.src(path);
    var promises = [];
    var deferredEN = Q.defer();
    var deferredFR = Q.defer();
    var deferredJP = Q.defer();
    promises.push(deferredEN.promise);
    promises.push(deferredFR.promise);
    promises.push(deferredJP.promise);

    stream.on('data', function() {
      setTimeout(function() {
        fs.readFile(outputFolder + input + '-en.html', readFileOptions, function(err, fileEN) {
          if (err) {
            console.log('error', err);
            deferredEN.reject();
          } else {
            assert.equal(fileEN.indexOf('<li>Language</li>'), 49);
            assert.equal(fileEN.indexOf('<li>English</li>'), 71);
            assert.equal(fileEN.indexOf('<li>French</li>'), 92);
            assert.equal(fileEN.indexOf('<html lang="en">'), 16);
            deferredEN.resolve();
          }
        });

        fs.readFile(outputFolder + input + '-fr.html', readFileOptions, function(err, fileFR) {
          if (err) {
            console.log('error', err);
          } else {
            assert.equal(fileFR.indexOf('<html lang="fr">'), 16);
            assert.equal(fileFR.indexOf('<li>Langue</li>'), 49);
            assert.equal(fileFR.indexOf('<li>Anglais</li>'), 69);
            assert.equal(fileFR.indexOf('<li>Français</li>'), 90);
            deferredFR.resolve();
          }
        });

        fs.readFile(outputFolder + input + '-jp.html', readFileOptions, function(err, fileJP) {
          if (err) {
            console.log('error', err);
          } else {
            assert.equal(fileJP.indexOf('<html lang="jp">'), 16);
            assert.equal(fileJP.indexOf('<li>言語</li>'), 49);
            assert.equal(fileJP.indexOf('<li>英語</li>'), 65);
            assert.equal(fileJP.indexOf('<li>フランス語</li>'), 81);
            deferredJP.resolve();
          }
        });
      }, 1000);

    });

    stream.on('end', function() {
      Q.all(promises).then(function() {
        doneCb();
      });
    });

    stream.pipe(i18nSwig({
        translations: locales,
        defaultLocale: locale,
        data: {
          assets: outputFolder
        },
        defaults: {
          cache: false,
          varControls: ['{@', '@}']
        }
      }))
      .pipe(gulp.dest(__dirname + '/output/'));
  }

  describe('A template', function() {
    var input = 'test1';
    var path = __dirname + '/fixtures/' + input + '.swig.html';
    it('should work for english', function(done) {
      doLeTest(input, path, 'en', done);
    });
    it('should work for french', function(done) {
      doLeTest(input, path, 'fr', done);
    });
    it('should work for 日本語', function(done) {
      doLeTest(input, path, 'jp', done);
    });
  });

  describe('A template within a weirdly named folder', function() {
    var input = 'test2';
    var path = __dirname + '/fixtures/multiple.folders/element/' + input + '.swig.html';
    it('should work for english', function(done) {
      doLeTest(input, path, 'en', done);
    });
    it('should work for french', function(done) {
      doLeTest(input, path, 'fr', done);
    });
    it('should work for 日本語', function(done) {
      doLeTest(input, path, 'jp', done);
    });
  });

});