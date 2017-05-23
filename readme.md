# Gulp Boilerplate
The defualt file is `gulpfile.babel.js` if you're having problems running it use `gulpfile.bkup.js`.<br> 
Remove `gulpfile'.bkup'.js` and add `.bkup` to `gulpfile.babel.js`, (eg `gulpfile.babel.bkup.js`)<br>
this removes the config file from gulps scope, `.bkup` can be replaced with any name. 

## Gulp
Current setup has 2 tasks `dev` and `build`. The default task is `dev` It will run `browsersync` to watch and update files,<br>
if you want to run the production build the `build` task is using `gulp-util` to set environment variables to run the build tasks.
* `gulp build --type prod`

### Dev Dependencies
* [babel-core](https://www.npmjs.com/package/babel-core)
* [babel-preset-env](https://www.npmjs.com/package/babel-preset-env)
* [babel-preset-es2015](https://www.npmjs.com/package/babel-preset-es2015)
* [babel-register](https://www.npmjs.com/package/babel-register) / (need for `gulpfile-babel.js`)
* [browser-sync](https://www.npmjs.com/package/browser-sync)
* [del](https://www.npmjs.com/package/del) / (for gulp clean function.)
* [eslint-config-airbnb](https://www.npmjs.com/package/eslint-config-airbnb) / (eslint needs to be globaly installed.)
* [gulp-rename](https://www.npmjs.com/package/gulp-rename)
* [gulp-sourcemaps](https://www.npmjs.com/package/gulp-sourcemaps)
* [gulp-util](https://www.npmjs.com/package/gulp-util)


## SASS
### File structure 
* [ITCSS](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/).<br>

### Dependencies
* [Normalize.css](https://necolas.github.io/normalize.css/) / v7.0
* [HTML5 ★ BOILERPLATE](https://html5boilerplate.com/) / v5.3


### Dev Dependencies
* [gulp-sass-glob](https://www.npmjs.com/package/gulp-sass-glob)
* [gulp-sass](https://www.npmjs.com/package/gulp-sass)
* [gulp-autoprefixer](https://www.npmjs.com/package/gulp-autoprefixer)
* [gulp-clean-css](https://www.npmjs.com/package/gulp-clean-css)

## Javascript

### File structure

### Dependencies

### Dev Dependencies
* [gulp-babel](https://www.npmjs.com/package/gulp-babel)
* [gulp-concat](https://www.npmjs.com/package/gulp-concat)
* [gulp-uglify](https://www.npmjs.com/package/gulp-uglify)

 