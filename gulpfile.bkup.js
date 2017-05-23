const gulp = require('gulp');
const babel = require('gulp-babel');
const del = require('del');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const cleanCss = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const gutil = require('gulp-util');
const browserSync = require('browser-sync');

const server = browserSync.create();

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

gulp.task('clean', () => del(['build']));

function reload(done) {
  server.reload();
  done();
}

// Style Tasks. SCSS -> CSS.
// Checks with '--type prod' to run production build.
gulp.task('styles', () => {
  gulp.src(paths.styles.src)
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
});

// JavaScript Tasks
// Checks with '--type prod' to run production build.
gulp.task('scripts', () => {
  gulp.src(paths.scripts.src)
    .pipe(gutil.env.type === 'prod' ? gutil.noop() : sourcemaps.init())
      .pipe(babel())
      .pipe(concat('bundle.js'))
      .pipe(uglify())
    .pipe(gutil.env.type === 'prod' ? gutil.noop() : sourcemaps.write('./'))
  .pipe(gulp.dest(paths.scripts.dest))
  .pipe(server.reload({ stream: true }));
});

// gulp.task('markup', () => {
//   return gulp.src(paths.markup.src)
//   .pipe(server.reload({ stream: true }));
// });

gulp.task('serve', (done) => {
  server.init({
    server: {
      baseDir: './',
    },
  });
  done();
});

// Watch for changes in src and all HTML files.
// Files: SCSS/SASS, JS, HTML
gulp.task('watch', () => {
  gulp.watch(paths.styles.src, gulp.series('styles'))
    .on('change', (path, stats) => {
      console.log(`File ${path} was changed`);
      // code to execute on change
    })
    .on('unlink', (path, stats) => {
      console.log(`File ${path} was removed`);
      // code to execute on delete
    });
  gulp.watch(paths.scripts.src, gulp.series('scripts'))
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
});

gulp.task('build', gulp.series('clean', gulp.parallel('styles', 'scripts')));

gulp.task('default',
  gulp.series('clean', 'styles', 'scripts', 'serve', 'watch',
  (done) => {
    done();
  }));
