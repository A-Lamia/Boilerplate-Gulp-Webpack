import '@babel/register';
import gulp from 'gulp';
import del from 'del';
import rename from 'gulp-rename';
import plumber from 'gulp-plumber';
import sass from 'gulp-sass';
import sassGlob from 'gulp-sass-glob';
import cleanCss from 'gulp-clean-css';
import sourcemaps from 'gulp-sourcemaps';
import autoprefixer from 'gulp-autoprefixer';
import imagemin from 'gulp-imagemin';
import through2 from 'through2';
import minimist from 'minimist';
import log from 'fancy-log';
import webpackStream from 'webpack-stream';
import webpack from 'webpack';
import webpackDM from 'webpack-dev-middleware';
import webpackHM from 'webpack-hot-middleware';
import browserSync from 'browser-sync';

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
  images: {
    src: './src/img/**/*',
    dest: './build/img/',
  },
};

export const clean = () => del(['build/css', 'build/js']);

function reload(done) {
  server.reload();
  done();
}

// Style Tasks. SCSS -> CSS.
// Checks with '--type prod' to run production build.
export function styles() {
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
}

export function scripts() {
  return gulp.src(paths.scripts.src)
    .pipe(plumber())
    .pipe(
      webpackStream(argv.type === 'prod' ? webpackConfigProd : webpackConfig, webpack)
        .on('error', (err) => {
          log('WEBPACK ERROR', err);
        }),
    )
    .pipe(gulp.dest(paths.scripts.dest));
}

function serve(done) {
  server.init({
    server: {
      baseDir: './build',
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

export function images(cb) {
  gulp.src(paths.images.src, { since: gulp.lastRun(styles) })
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.jpegtran({ progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 }),
      imagemin.svgo({
        plugins: [
          { removeViewBox: true },
          { cleanupIDs: false },
        ],
      }),
    ]))
    .pipe(gulp.dest(paths.images.dest));
  cb();
}


// Watch for changes in src and all HTML files.
// Files: SCSS/SASS, JS, HTML
export function watch() {
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
  gulp.watch(paths.images.src, gulp.series(images))
    .on('change', (path, stats) => {
      log(`File ${path} was changed`);
      // code to execute on change
    })
    .on('unlink', (path, stats) => {
      log(`File ${path} was removed`);
      // code to execute on delete
    });
}


export const img = gulp.series(images);

export const build = gulp.series(clean, gulp.parallel(styles, scripts, images));

const dev = gulp.series(clean, styles, serve, images, watch);

export default dev;
