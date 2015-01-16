'use strict';

var del = require('del');
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');

gulp.task('clean', function() {
  del(['test/output']);
});

gulp.task('lint', function() {
  return gulp.src(['index.js', 'test/**.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('test', ['clean'], function () {
  return gulp.src('test/**.js', {read: false})
    .pipe(mocha({reporter: 'nyan'}));
});

gulp.task('default', ['lint', 'test']);