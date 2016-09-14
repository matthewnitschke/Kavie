var gulp = require('gulp');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var strip = require('gulp-strip-comments');

gulp.task('scripts', function() {
    gulp.src('src/kavie.js')
        .pipe(rename('kavie.min.js'))
        .pipe(uglify({ preserveComments: "license" }).on('error', gutil.log))
        .pipe(gulp.dest('dist'));

    gulp.src('src/kavie.js')
        .pipe(strip({ safe: true }))
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['scripts']);
