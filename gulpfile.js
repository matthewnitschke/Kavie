var gulp = require('gulp');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var strip = require('gulp-strip-comments');

var pJson = require("./package.json");
var inject = require("gulp-inject-string");

gulp.task('scripts', function() {

    var versionNumber = pJson.version;

    gulp.src(['src/kavie.js', 'node_modules/promise-polyfill/promise.min.js'])
        .pipe(uglify({ preserveComments: "license" }).on('error', gutil.log))
        .pipe(concat('kavie.min.js'))
        .pipe(inject.replace("{{versionNumber}}", versionNumber))
        .pipe(gulp.dest('dist'));

    gulp.src(['src/kavie.js', 'node_modules/promise-polyfill/promise.min.js'])
        .pipe(concat('kavie.js'))
        .pipe(strip({ safe: true }))
        .pipe(inject.replace("{{versionNumber}}", versionNumber))
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['scripts']);
