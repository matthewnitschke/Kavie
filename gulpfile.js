var gulp = require('gulp');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var strip = require('gulp-strip-comments');

gulp.task('scripts', function() {
    gulp.src(['node_modules/promise-polyfill/promise.min.js', 'src/kavie.js'])
        .pipe(uglify({ preserveComments: "license" }).on('error', gutil.log))
        .pipe(concat('kavie.min.js'))
        .pipe(gulp.dest('dist'));

    gulp.src(['node_modules/promise-polyfill/promise.min.js', 'src/kavie.js'])
        .pipe(concat('kavie.js'))
        .pipe(strip({ safe: true }))
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['scripts']);
