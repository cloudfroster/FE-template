/**
 * gulp 自动构建任务
 * made by marchen
 * time 2015/3/9
 */
var pkg = require('./package.json');
var gulp = require('gulp');
var header = require('gulp-header');      //头部banner
var browserSync = require('browser-sync');//浏览器同步
var reload = browserSync.reload;		  //刷新浏览器

var now = new Date().toLocaleString();
var proxyUrl = "localhost:3000";
var cssUrl = "./public/css/**/*.css";
var viewsAJsUrl = ['./views/**/*.*','./public/js/**/*.js','!./public/js/lib/'];

//-------------------------------------------------//
//|          默认开始监视任务,视图,css.js
//-------------------------------------------------//
gulp.task('default',['watch']);

//-------------------------------------------------//
//|          监视css文件改变后刷新流
//-------------------------------------------------//
gulp.task('watch-css', function(){
	browserSync({
        proxy: proxyUrl
    });
	gulp.watch(cssUrl, function(){
        gulp.src(cssUrl)
            .pipe(reload({stream:true}));
    });
	console.log('watching css');
});

//-------------------------------------------------//
//|          监视视图,js文件改变后刷新浏览器
//-------------------------------------------------//
gulp.task('watch-views-js', function(){
	browserSync({
        proxy: proxyUrl
    });
	gulp.watch(viewsAJsUrl).on('change',reload);
	console.log('watching js and views');
});

//-------------------------------------------------//
//|          开始监视任务,视图,css.js
//-------------------------------------------------//
gulp.task('watch',function() {
	browserSync({
        proxy: proxyUrl
    });
    gulp.watch(cssUrl, function(){
        gulp.src(cssUrl)
            .pipe(reload({stream:true}));
    });
    gulp.watch(viewsAJsUrl).on('change',reload);
	console.log('watching css js and views');
});