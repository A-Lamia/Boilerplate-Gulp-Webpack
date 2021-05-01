import '@babel/register';
import path from 'path';
import gulp from 'gulp';
import del from 'del';
import rename from 'gulp-rename';
import plumber from 'gulp-plumber';
import sass from 'gulp-sass-no-nodesass';
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
import htmlInjector from 'bs-html-injector';
import pug from 'gulp-pug-3';

const argv = minimist(process.argv.slice(2), {
  string: 'type', // --type prod
  boolean: 'noinject',
  boolean: 'debug', // --debug bool
  boolean: 'source', // --debug bool
  boolean: 'clean', // --clean bool
});

log(argv);

const bs = browserSync.create();

const webpackConfig = require('./webpack.config');
const webpackConfigProd = require('./webpack.config.prod');

const compiler = webpack(webpackConfig);

sass.compiler = require('sass');

const paths = {
  base: path.resolve(__dirname),
  build: {
    css: './build/css',
    js: './build/js',
    base: './build',
  },
  pug: {
    src: './src/pug/**/*.pug',
    dest: './build',
  },
  styles: {
    src: './src/scss/**/*.scss',
    dest: './build/css/',
  },
  scripts: {
    src: 'src/scripts/**/*.js',
    dest: './build/js/',
  },
  markup: {
    src: './build/**/*.html',
  },
  images: {
    src: './src/img/**/*',
    dest: './build/img/',
  },
};

export const clean = () => del([
  paths.build.css, 
  paths.build.js,
]);

function reload(done) {
  bs.reload();
  done();
}

export function markup() {
  return gulp.src(paths.pug.src)
  .pipe(pug({
    // pretty: true,
  }))
  .pipe(gulp.dest(paths.pug.dest));
}

// Style Tasks. SCSS -> CSS.
// Checks with '--type prod' to run production build.
export function styles() {
  return gulp.src(paths.styles.src)
    .pipe(argv.debug || argv.source ? sourcemaps.init() : through2.obj())
    .pipe(sass({}))
    .on('error', sass.logError)
    .pipe(autoprefixer({
      overrideBrowserlist: ['last 2 versions'],
      cascade: false,
    }))
    .pipe(argv.type === 'prod' ? cleanCss() : through2.obj())
    .pipe(argv.debug || argv.clean ? cleanCss() : through2.obj())
    .pipe(rename({
      basename: 'main',
      suffix: '.min',
    }))
    .pipe(argv.debug || argv.source ? sourcemaps.write('./') : through2.obj())
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(bs.reload({ stream: true }));
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
  argv.noinject ? through2.obj() : bs.use(htmlInjector, {
    files: paths.markup.src,
  });
  bs.init({
    server: {
      baseDir: paths.build.base,
    },
    open: false,

    middleware: [
      webpackDM(compiler, {
        publicPath: webpackConfig.output.publicPath,
        stats: { colors: true },
        stats: 'errors-only',
        // writeToDisk: true,
      }),
      webpackHM(compiler, {
        reload: true,
      }),
    ],
  });
  done();
}

export function images(cb) {
  gulp.src(paths.images.src, { since: gulp.lastRun(styles) })
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.mozjpeg({quality: 75, progressive: true}),
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
// Files: SCSS/SASS, JS, HTML, png/jpg/svg/gif
export function watch() {
  gulp.watch(paths.styles.src, gulp.series(styles))
    .on('change', (location) => {
      log(`File ${location} was changed`);
      // code to execute on change
    })
    .on('unlink', (location) => {
      log(`File ${location} was removed`);
      // code to execute on delete
    });
  gulp.watch(paths.scripts.src)
    .on('change', (location) => {
      log(`File ${location} was changed`);
      // code to execute on change
    })
    .on('unlink', (location) => {
      log(`File ${location} was removed`);
      // code to execute on delete
    });
  gulp.watch(paths.pug.src, gulp.series(markup))
    .on('change', (location) => {
      log(`File ${location} was changed`);
      // code to execute on change
    })
    .on('unlink', (location) => {
      log(`File ${location} was removed`);
      // code to execute on delete
    }) 
  gulp.watch(paths.images.src, gulp.series(images))
    .on('change', (location) => {
      log(`File ${location} was changed`);
      // code to execute on change
    })
    .on('unlink', (location) => {
      log(`File ${location} was removed`);
      // code to execute on delete
    });
}


export const img = gulp.series(images);

export const build = gulp.series(clean, gulp.parallel(styles, scripts, images));

const dev = gulp.series(clean, markup, styles, serve, images, watch);

export default dev;
