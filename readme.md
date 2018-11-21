# Gulp & Webpack Boilerplate
The defualt file is `gulpfile.babel.js` if you're having problems running it use `gulpfile.bkup.js`.<br> 
Remove `gulpfile'.bkup'.js` and add `.bkup` to `gulpfile.babel.js`, (eg `gulpfile.babel.bkup.js`)<br>
this removes the config file from gulps scope, `.bkup` can be replaced with any name. 

## Gulp
Current setup has 2 tasks `dev` and `build`. The default task is `dev` It will run `browsersync` to watch and update files,<br>
if you want to run the production build the `build` task is using `minimist` to set environment variables to run the build tasks.
* `gulp build --type prod`

## HTML
HTML live loading (`bs-html-injector`) is enabled by default, there is currently no terminal logging support. If you would like to disable live reload and enable standard browser sync page refresh comment out `bs.use(htmlInjector)` and uncomment code bellow in `gulpfile.bable.js` or `gulpfile.js`.
```js
  gulp.watch(paths.markup.src, gulp.series(reload))
    .on('change', (path, stats) => {
      log(`File ${path} was changed`);
      // code to execute on change
    })
    .on('unlink', (path, stats) => {
      log(`File ${path} was removed`);
      // code to execute on delete
    });
```


## CSS / SASS
### File structure 
* [ITCSS](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/).<br>

### Dependencies
* [Normalize.css](https://necolas.github.io/normalize.css/) / v8.0.1
* [HTML5 ★ BOILERPLATE](https://html5boilerplate.com/) / v6.1.0

## JS

## Dev Dependencies

>>>
### ___notice:___ 
`gulp-util` has been depricated use [source](https://github.com/gulpjs/gulp-util) for more info on replacement libs.
>>>

`gutil.noop()` can be replaced with the library `through2` code equivalent is `through2.obj()`
* [@babel/core](https://www.npmjs.com/package/@babel/core)
* [@babel/register](https://www.npmjs.com/package/@babel/register) / needed to run `gulpfile-babel.js`.
* [@babel/preset-env](https://www.npmjs.com/package/@babel/preset-env)
* [browser-sync](https://www.npmjs.com/package/browser-sync)
* [bs-html-injector](https://www.npmjs.com/package/bs-html-injector)
* [bs-html-injector](https://www.npmjs.com/package/bs-html-injector)
* [del](https://www.npmjs.com/package/del) / for gulp clean function.
* [eslint-config-airbnb](https://www.npmjs.com/package/eslint-config-airbnb) / eslint needs to be globaly installed. `npm i eslint -g`
* [fancy-log](https://www.npmjs.com/package/fancy-log)
* [gulp](https://www.npmjs.com/package/gulp)
* [gulp-autoprefixer](https://www.npmjs.com/package/gulp-autoprefixer)
* [gulp-clean-css](https://www.npmjs.com/package/gulp-clean-css)
* [gulp-concat](https://www.npmjs.com/package/gulp-concat)
* [gulp-plumber](https://www.npmjs.com/package/gulp-plumber)
* [gulp-rename](https://www.npmjs.com/package/gulp-rename)
* [gulp-sass](https://www.npmjs.com/package/gulp-sass)
* [gulp-sass-glob](https://www.npmjs.com/package/gulp-sass-glob)
* [gulp-sourcemaps](https://www.npmjs.com/package/gulp-sourcemaps)
* [minimist](https://www.npmjs.com/package/minimist)
* [through2](https://www.npmjs.com/package/through2)
* [Webpack](https://www.npmjs.com/package/webpack)
* [webpack-dev-middleware](https://www.npmjs.com/package/webpack-dev-middleware)
* [webpack-hot-middleware](https://www.npmjs.com/package/webpack-hot-middleware)
* [webpack-module-hot-accept](https://www.npmjs.com/package/webpack-module-hot-accept)
* [webpack-stream](https://www.npmjs.com/package/webpack-stream)



 