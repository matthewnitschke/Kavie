const gulp = require('gulp');
const gutil = require('gulp-util');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const strip = require('gulp-strip-comments');

const pJson = require("./package.json");
const inject = require("gulp-inject-string");

gulp.task('scripts', function() {

    var versionNumber = pJson.version;

    gulp.src(['src/kavie.js'])
        .pipe(uglify({ preserveComments: "license" }).on('error', gutil.log))
        .pipe(concat('kavie.min.js'))
        .pipe(inject.replace("{{versionNumber}}", versionNumber))
        .pipe(gulp.dest('dist'));

    gulp.src(['src/kavie.js'])
        .pipe(concat('kavie.js'))
        .pipe(strip({ safe: true }))
        .pipe(inject.replace("{{versionNumber}}", versionNumber))
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
  gulp.watch("src/kavie.js", ['scripts'])
})

gulp.task('default', ['scripts']);
