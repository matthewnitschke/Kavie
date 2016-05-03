// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');


// Concatenate & Minify JS
gulp.task('scripts', function() {
    return gulp.src('src/kavie.js')
        .pipe(rename('kavie.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('src/kavie.js', ['scripts']);
});

// Default Task
gulp.task('default', ['scripts', 'watch']);
