import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import del from 'del';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;
const paths = {
  base: 'app/',
  js: 'js/**/*.js',
  app: 'js/app.js',
  bundle: 'js/bundle.js',
  scss: 'css/**/*.scss',
  css: 'css/**/*.css',
  html: '**/*.html',
  dist: 'dist/',
  tmp: '.tmp/'
}

// JavaScript Linter
gulp.task('eslint', () => {
  return gulp.src(paths.base + paths.js)
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failOnError());
});

// JavaScript
gulp.task('build:js', ['eslint'], $.shell.task([
  `jspm bundle-sfx ${paths.app} ${paths.dist}${paths.bundle} --minify`
]));

// SCSS
gulp.task('scss', () => {
  return gulp.src(
      paths.base + paths.scss,
      {base: paths.base}
    )
    .pipe($.sass().on('error', $.sass.logError))
    .pipe(gulp.dest(paths.tmp))
    .pipe(browserSync.stream());
})

// HTML
gulp.task('build:html', () => {
  return gulp.src(
      [
        paths.base + paths.html,
        `!${paths.base}jspm_packages/**/*.*`
      ],
      {base: paths.base}
    )
    .pipe($.htmlReplace({
      'js': paths.bundle
    }))
    .pipe(gulp.dest(paths.dist));
});

// Clean
gulp.task('clean', () => {
  return del([
    paths.dist
  ]);
});

// Build CSS
gulp.task('build:css', ['scss'], () => {
  return gulp.src(
    paths.tmp + paths.css,
    {base: paths.tmp}
  )
  .pipe(gulp.dest(paths.dist));
});

// Build
gulp.task('build', ['build:css', 'build:js', 'build:html']);

// Serve
gulp.task('serve', ['scss'], () => {
  browserSync({
    server: {
      baseDir: [paths.base, paths.tmp]
    }
  });

  gulp.watch(paths.base + paths.js).on('change', reload);
  gulp.watch(paths.base + paths.scss, ['scss']);
  gulp.watch(paths.base + paths.html).on('change', reload);
});

// Default Build
gulp.task('default', ['clean'], () => {
  gulp.start('build');
});
