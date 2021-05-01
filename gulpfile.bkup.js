const path = require('path');
const gulp = require('gulp');
const del = require('del');
const rename = require('gulp-rename');
const plumber = require('gulp-plumber');
const sass = require('gulp-sass-no-nodesass');
const cleanCss = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const through2 = require('through2');
const minimist = require('minimist');
const log = require('fancy-log');
const webpackStream = require('webpack-stream');
const webpack = require('webpack');
const webpackDM = require('webpack-dev-middleware');
const webpackHM = require('webpack-hot-middleware');
const browserSync = require('browser-sync');
const htmlInjector = require('bs-html-injector');

const argv = minimist(process.argv.slice(2), {
  string: 'type', //--type = prod
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
    markup: './build/**/*.html'
  },
  pug: {
    src: './src/pug/**/!(_)*.pug',
    src_watch: './src/pug/**/*.pug',
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

function clean(cb) { 
  del([
    paths.build.css, 
    paths.build.js,
    paths.build.markup
  ]); 
  cb(); }

function reload(done) {
  bs.reload();
  done();
}

function markup(cb) {
  return gulp.src(paths.pug.src)
    .pipe(pug({
      // pretty: true,
    }))
    .pipe(gulp.dest(paths.pug.dest))
    .pipe(argv.noinject ? bs.reload({ stream: true }) : through2.obj());
  cb();
}

// Style Tasks. SCSS -> CSS.
// Checks with '--type prod' to run production build.
function styles(cb) {
  return gulp.src(paths.styles.src, { since: gulp.lastRun(styles) })
    .pipe(argv.debug || argv.source ? sourcemaps.init() : through2.obj())
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
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
      }),
      webpackHM(compiler),
    ],
  });
  done();
}

function images(cb) {
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
// Files: SCSS/SASS, JS, HTML
function watch(cb) {
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
  gulp.watch(paths.markup.src, gulp.series(markup))
    .on('change', (location) => {
      log(`File ${location} was changed`);
      // code to execute on change
    })
    .on('unlink', (location) => {
      log(`File ${location} was removed`);
      // code to execute on delete
    });
  gulp.watch(paths.images.src, gulp.series(images))
    .on('change', (location) => {
      log(`File ${location} was changed`);
      // code to execute on change
    })
    .on('unlink', (location) => {
      log(`File ${location} was removed`);
      // code to execute on delete
    });
  cb();
}

gulp.task('img', gulp.series(clean, images));

gulp.task('build', gulp.series(clean, gulp.parallel(markup, styles, scripts, images)));

gulp.task('default', gulp.series(clean, markup, styles, serve, images, watch));

