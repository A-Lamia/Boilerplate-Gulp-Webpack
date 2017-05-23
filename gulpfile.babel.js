import 'babel-register';
import gulp from 'gulp';
import babel from 'gulp-babel';
import del from 'del';
import rename from 'gulp-rename';
import sass from 'gulp-sass';
import sassGlob from 'gulp-sass-glob';
import cleanCss from 'gulp-clean-css';
import sourcemaps from 'gulp-sourcemaps';
import autoprefixer from 'gulp-autoprefixer';
import gutil from 'gulp-util';
import plumber from 'gulp-plumber';
import webpackStream from 'webpack-stream';
import webpack from 'webpack';
import webpackDM from 'webpack-dev-middleware';
import webpackHM from 'webpack-hot-middleware';
import browserSync from 'browser-sync';

const server = browserSync.create();
const webpackConfig = require('./webpack.config');

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

export const clean = () => del(['build']);

// export const reload = (done) => { server.reload(); done(); };

function reload(done) {
  server.reload();
  done();
}


// Style Tasks. SCSS -> CSS.
// Checks with '--type prod' to run production build.
export function styles() {
  return gulp.src(paths.styles.src)
    .pipe(gutil.env.type === 'prod' ? gutil.noop() : sourcemaps.init())
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
    .pipe(gutil.env.type === 'prod' ? gutil.noop() : sourcemaps.write('./'))
  .pipe(gulp.dest(paths.styles.dest))
  .pipe(server.reload({ stream: true }));
}

export function scripts() {
  return gulp.src(paths.scripts.src)
    .pipe(plumber())
    .pipe(
      webpackStream(webpackConfig, webpack)
      .on('error', (err) => {
        gutil.log('WEBPACK ERROR', err);
      }),
    )
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(server.reload({ stream: true }));
}

function serve(done) {
  server.init({
    server: {
      baseDir: './',
    },
    open: false,

    // middleware: [
    //   webpackDM(webpackConfig, {
    //     publicPath: paths.scripts.dest,
    //     stats: { colors: true },
    //     watch: true,
    //   }),
    //   webpackHM(webpackConfig),
    // ],
  });
  done();
}


// Watch for changes in src and all HTML files.
// Files: SCSS/SASS, JS, HTML
export function watch() {
  gulp.watch(paths.styles.src, gulp.series(styles))
    .on('change', (path, stats) => {
      console.log(`File ${path} was changed`);
      // code to execute on change
    })
    .on('unlink', (path, stats) => {
      console.log(`File ${path} was removed`);
      // code to execute on delete
    });
  gulp.watch(paths.scripts.src, gulp.series(scripts))
    .on('change', (path, stats) => {
      console.log(`File ${path} was changed`);
      // code to execute on change
    })
    .on('unlink', (path, stats) => {
      console.log(`File ${path} was removed`);
      // code to execute on delete
    });
  gulp.watch(paths.markup.src, gulp.series(reload))
    .on('change', (path, stats) => {
      console.log(`File ${path} was changed`);
      // code to execute on change
    })
    .on('unlink', (path, stats) => {
      console.log(`File ${path} was removed`);
      // code to execute on delete
    });
}


export const build = gulp.series(clean, gulp.parallel(styles, scripts));

const dev = gulp.series(clean, styles, scripts, serve, watch);
// const dev = gulp.series(clean, styles, serve, watch);

export default dev;
