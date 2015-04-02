/**
 * gulp 自动构建任务
 * made by marchen
 * time 2015/4/2
 */
 
var pkg = require('./package.json');
var gulp = require('gulp');
var plumber = require('gulp-plumber');    //修复node错误
var changed = require('gulp-changed');    //只通过改变的文件流
var less = require('gulp-less');          //编译less
var watchLess = require('gulp-watch-less');//监视less文件
var coffee = require('gulp-coffee');      //编译coffee
var sourcemaps = require('gulp-sourcemaps');//生成map文件
var header = require('gulp-header');      //头部banner
var browserSync = require('browser-sync');//浏览器同步
var reload = browserSync.reload;		  //刷新浏览器

var now = new Date().toLocaleString();
var proxyUrl = "localhost:3000";
var cssUrl = ["./public/css/**/*.css"];
var viewsAJsUrl = ['./views/**/*.*','./public/js/**/*.js','!./public/js/lib/'];
var lessUrl = ['./public/css/**/*.less','!./public/css/maxin/**/*.less','!./public/css/common/**/*.less'];
var lessDest = './public/css/';
var coffeeUrl = ['./public/js/**/*.coffee'];
var coffeeDest = './public/js';

//-------------------------------------------------//
//|          默认开始编译所有less和coffee文件
//|          监视css,js,和views下的的文件,刷新浏览器(注意:会去编译less和coffee)
//-------------------------------------------------//
gulp.task('default',['compile-less', 'compile-coffee', 'watch-compile'],function() {console.log('\n编译less为css,编译coffee为js完成.\n默认不会打开browserSync工具.请使用 gulp localhost 打开浏览器同步工具.\n开始监听less,coffee文件......\n');});
gulp.task('localhost',['compile-less', 'compile-coffee', 'watch-compile-reload'],function() {console.log('\n编译less为css,编译coffee为js完成.\n开始监听less,coffee文件......\n等待刷新浏览器......\n');});

//-------------------------------------------------//
//|   开始监视less,coffee,改变后编译,不刷新浏览器
//-------------------------------------------------//
gulp.task('watch-compile', function() {
    gulp.watch(lessUrl, function() {
        gulp.src(lessUrl)
          .pipe(sourcemaps.init())
          .pipe(plumber())
          .pipe(changed(lessDest, {extension: '.css'}))
          .pipe(less())
          .pipe(sourcemaps.write('./sourcemaps'))
          .pipe(gulp.dest(lessDest));
        return console.log('compileless passed!');
    });
    gulp.watch(coffeeUrl, function() {
       gulp.src(coffeeUrl)
         .pipe(sourcemaps.init())
         .pipe(plumber())
         .pipe(changed(coffeeDest, {extension: '.js'}))
         .pipe(coffee({bare: true}))
         .pipe(sourcemaps.write('./sourcemaps'))
         .pipe(gulp.dest(coffeeDest));
       return console.log('compilecoffee passed!');
    });
});

//-------------------------------------------------//
//|   开始监视less,coffee,改变后编译,刷新浏览器
//-------------------------------------------------//
gulp.task('watch-compile-reload', function() {
    //打开浏览器同步工具
    browserSync({
        proxy: proxyUrl
    });
    gulp.watch(lessUrl, function() {
        gulp.src(lessUrl)
          .pipe(sourcemaps.init())
          .pipe(plumber())
          .pipe(changed(lessDest, {extension: '.css'}))
          .pipe(less())
          .pipe(sourcemaps.write('./sourcemaps'))
          .pipe(reload({stream:true}))
          .pipe(gulp.dest(lessDest));
        return console.log('compileless passed!');
    });
    gulp.watch(coffeeUrl, function() {
       gulp.src(coffeeUrl)
         .pipe(sourcemaps.init())
         .pipe(plumber())
         .pipe(changed(coffeeDest, {extension: '.js'}))
         .pipe(coffee({bare: true}))
         .pipe(sourcemaps.write('./sourcemaps'))
         .pipe(gulp.dest(coffeeDest))
       return console.log('compilecoffee passed!');
    });
    gulp.watch(viewsAJsUrl).on('change',reload);
});

//-------------------------------------------------//
//|          全部less文件编译成css
//-------------------------------------------------//
gulp.task('compile-less', function() {
    return gulp.src(lessUrl)
      .pipe(sourcemaps.init())
      .pipe(less())
      .pipe(sourcemaps.write('./sourcemaps'))
      .pipe(gulp.dest(lessDest));
});

//-------------------------------------------------//
//|          全部coffee文件编译成js
//-------------------------------------------------//
gulp.task('compile-coffee', function() {
    return gulp.src(coffeeUrl)
      .pipe(sourcemaps.init())
      .pipe(coffee({bare: true}))
      .pipe(sourcemaps.write('./sourcemaps'))
      .pipe(gulp.dest(coffeeDest));
});