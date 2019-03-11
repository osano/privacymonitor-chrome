var gulp 		= require('gulp'),
	gulpif 		= require('gulp-if'),
	sequence 	= require('run-sequence'),
	cssmin 		= require('gulp-cssmin'),
	clean 		= require('gulp-clean'),
	terser 		= require('gulp-terser'),
	manifest 	= require('gulp-chrome-manifest'),
	zip 		= require('gulp-zip');

var distDir = 'dist/';

gulp.task('build', function() {
	return gulp.src('manifest.json')
		.pipe(manifest({
			buildnumber: true
		}))
		.pipe(gulpif('css/**/*.css', cssmin()))
		//.pipe(gulpif('js/**/*.js', terser()))
		.pipe(gulp.dest(distDir))
});

gulp.task('copyImages', function() {
	return gulp.src('css/images/*')
		.pipe(gulp.dest(distDir + 'css/images'));
});

gulp.task('copyIcons', function() {
	return gulp.src('icons/*')
		.pipe(gulp.dest(distDir + 'icons'));
});

gulp.task('copyManifest', function() {
	return gulp.src(distDir + 'manifest.json')
		.pipe(gulp.dest('./'));
});

gulp.task('zip', () =>
	gulp.src([
		distDir + '**/*',
		'!__MACOSX/**',
		'!**/.DS_Store'
	])
		.pipe(zip('upload.zip'))
		.pipe(gulp.dest('./'))
);

gulp.task('clean', function () {
	return gulp.src(distDir, {read: false})
		.pipe(clean());
});

gulp.task('default', function(){
	return sequence('build', 'copyImages', 'copyIcons', 'copyManifest', 'zip', 'clean');
});
