const gulp = require('gulp');
const del = require('del');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const cleanCss = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const through2 = require('through2');
const minimist = require('minimist');
const log = require('fancy-log');
const plumber = require('gulp-plumber');
const webpackStream = require('webpack-stream');
const webpack = require('webpack');
const webpackDM = require('webpack-dev-middleware');
const webpackHM = require('webpack-hot-middleware');
const browserSync = require('browser-sync');

const argv = minimist(process.argv.slice(2), {
  string: 'type', // --lang prod
});

log(argv);

const server = browserSync.create();

const webpackConfig = require('./webpack.config');
const webpackConfigProd = require('./webpack.config.prod');

const bundler = webpack(webpackConfig);

const paths = {
  base: './build',
  styles: {
    src: './src/scss/**/*.scss',
    dest: './build/css/',
  },
  scripts: {
    src: 'src/scripts/**/*.js',
    dest: './build/js/',
  },
  markup: {
    src: './**/*.html',
  },
};

function clean(cb) { del(['build/css', 'build/js']); cb(); }

function reload(done) {
  server.reload();
  done();
}

// Style Tasks. SCSS -> CSS.
// Checks with '--type prod' to run production build.
function styles(cb) {
  return gulp.src(paths.styles.src, { since: gulp.lastRun(styles) })
    .pipe(argv.type === 'prod' ? through2.obj() : sourcemaps.init())
    .pipe(sassGlob())
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false,
    }))
    .pipe(cleanCss())
    .pipe(rename({
      basename: 'main',
      suffix: '.min',
    }))
    .pipe(argv.type === 'prod' ? through2.obj() : sourcemaps.write('./'))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(server.reload({ stream: true }));
  cb();
}

function scripts(cb) {
  return gulp.src(paths.scripts.src)
    .pipe(plumber())
    .pipe(
      webpackStream(argv.type === 'prod' ? webpackConfigProd : webpackConfig, webpack)
        .on('error', (err) => {
          log('WEBPACK ERROR', err);
        }),
    )
    .pipe(gulp.dest(paths.scripts.dest));
  cb();
}

function serve(done) {
  server.init({
    server: {
      baseDir: './',
    },
    open: false,

    middleware: [
      webpackDM(bundler, {
        publicPath: webpackConfig.output.publicPath,
        stats: { colors: true },
        stats: 'errors-only',
      }),
      webpackHM(bundler),
    ],
  });
  done();
}


// Watch for changes in src and all HTML files.
// Files: SCSS/SASS, JS, HTML
function watch(cb) {
  gulp.watch(paths.styles.src, gulp.series(styles))
    .on('change', (path, stats) => {
      log(`File ${path} was changed`);
      // code to execute on change
    })
    .on('unlink', (path, stats) => {
      log(`File ${path} was removed`);
      // code to execute on delete
    });
  gulp.watch(paths.scripts.src)
    .on('change', (path, stats) => {
      log(`File ${path} was changed`);
      // code to execute on change
    })
    .on('unlink', (path, stats) => {
      log(`File ${path} was removed`);
      // code to execute on delete
    });
  gulp.watch(paths.markup.src, gulp.series(reload))
    .on('change', (path, stats) => {
      log(`File ${path} was changed`);
      // code to execute on change
    })
    .on('unlink', (path, stats) => {
      log(`File ${path} was removed`);
      // code to execute on delete
    });
  cb();
}


gulp.task('build', gulp.series(clean, gulp.parallel(styles, scripts)));

gulp.task('default', gulp.series(clean, styles, serve, watch));

