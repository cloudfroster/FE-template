/**
 * gulp 自动构建任务
 * made by marchen
 * time 2015/4/2
 * task gulp default            编译,监听
 *      gulp proxy              编译,监听,打开浏览器同步工具(代理模式)
 *      gulp server             编译,监听,打开浏览器同步工具(静态页面模式)
 *      gulp server-no-compile  监听,打开浏览器同步工具(静态页面模式)
 *      gulp release            这条命令适合开发这个库的开发者使用
 * 待解决问题,less文件修改只会刷新修改的文件,如果一个被引用的文件修改了,引用文件不会自动刷新,需要手动保存下.
 */
 
var pkg = require('./package.json');
var gulp = require('gulp');
var zip = require("gulp-zip");              //压缩打包成zip
var plumber = require('gulp-plumber');      //修复node错误
var gutil = require('gulp-util');           //gulp工具,用来在流中输出
var changed = require('gulp-changed');      //只通过改变的文件流
var less = require('gulp-less');            //编译less
var watchLess = require('gulp-watch-less'); //监视less文件
var coffee = require('gulp-coffee');        //编译coffee
var sourcemaps = require('gulp-sourcemaps');//生成map文件
var rename = require("gulp-rename");        //重命名
var uglify = require('gulp-uglify');        //压缩js
var header = require('gulp-header');        //头部banner
var browserSync = require('browser-sync');  //浏览器同步
var reload = browserSync.reload;		        //刷新浏览器


var serverBaseUrl = './views/';             //browserSync 服务器模式目录
var proxyUrl = "localhost:3000";            //browserSync 代理模式路径
var viewsAJsUrl = ['./views/**/*.*','./public/js/**/*.min.js','!./public/js/lib/**/*.js'];
var htmlAJsUrl = ['./views/**/*.*','./**/*.js'];
var lessUrl = ['./public/css/**/*.less','!./public/css/maxin/**/*.less','!./public/css/common/**/*.less'];
var lessDest = './public/css/';
var coffeeUrl = ['./public/js/**/*.coffee'];
var coffeeDest = './public/js';
var jsUrl = ['./public/js/**/*.js','!./public/js/lib/**/*.js','!./public/js/**/*.min.js']
var jsDest = './public/js';
var releaseUrl = ['./**',,'!node_modules','!node_modules/**','!down','!down/**','!npm-debug.log'];
//-------------------------------------------------//
//| 默认开始编译所有less和coffee文件
//| 监视css,js,和views下的的文件,刷新浏览器(注意:会去编译less和coffee)
//-------------------------------------------------//
gulp.task('default',['compile-less', 'compile-coffee', 'compress-js', 'watch-compile'],function() {
    gutil.log('\n\n',gutil.colors.cyan('编译less为css,编译coffee为js完成.\n'),'默认不会打开browserSync工具.请使用',gutil.colors.red('gulp localhost'),'打开浏览器同步工具.\n' + 
    ' 编译规则:\n yyy.less   ---- yyy.css(压缩)\n xxx.coffee ---- xxx.min.js(压缩) \n yyy.js   ---- yyy.min.js(压缩) \n 产生的sourcemaps文件放在sourcemaps文件夹下.\n' + ' 开始监听less,js,coffee文件......\n');
});
gulp.task('proxy',['compile-less', 'compile-coffee', 'compress-js', 'watch-compile-proxy-reload'],function() {
    gutil.log('\n\n',gutil.colors.cyan('编译less为css,编译coffee为js完成.\n'),'打开browserSync工具\n' + 
    ' 编译规则:\n yyy.less   ---- yyy.css(压缩)\n xxx.coffee ---- xxx.min.js(压缩) \n yyy.js   ---- yyy.min.js(压缩) \n 产生的sourcemaps文件放在sourcemaps文件夹下.\n' + ' 开始监听less,js,coffee文件......\n');
});
gulp.task('server',['compile-less', 'compile-coffee', 'compress-js', 'watch-compile-server-reload'],function() {
    gutil.log('\n\n',gutil.colors.cyan('编译less为css,编译coffee为js完成.\n'),'打开browserSync工具\n' + 
    ' 编译规则:\n yyy.less   ---- yyy.css(压缩)\n xxx.coffee ---- xxx.min.js(压缩) \n yyy.js   ---- yyy.min.js(压缩) \n 产生的sourcemaps文件放在sourcemaps文件夹下.\n' + ' 开始监听less,js,coffee文件......\n');
});
gulp.task('server-no-compile',['watch-server-reload'],function() {
    gutil.log('\n\n',gutil.colors.cyan('不启用编译功能.\n'),'打开browserSync工具\n只监听文件下改变后刷新浏览器\n'+'开始监听html,css,js文件......\n');
});
    
//-------------------------------------------------//
//|  开始监视less,coffee,js改变后编译,不刷新浏览器
//-------------------------------------------------//
gulp.task('watch-compile', function() {
    gulp.watch(lessUrl, function() {
        return gulp.src(lessUrl)
          .pipe(sourcemaps.init())
          .pipe(plumber())
          .pipe(changed(lessDest, {extension: '.css'}))
          .pipe(less({compress:true})).on('error', function(err){gutil.log(gutil.colors.red('less compile error!\n') + err.message)})
          .pipe(gulp.dest(lessDest))
          .pipe(sourcemaps.write('./sourcemaps'));
    });   
    gulp.watch(coffeeUrl, function() {
       return gulp.src(coffeeUrl)
         .pipe(sourcemaps.init())
         .pipe(plumber())
         .pipe(changed(coffeeDest, {extension: '.min.js'}))
         .pipe(coffee({bare: true})).on('error', function(err){gutil.log(gutil.colors.red('coffee compile error!\n') + err)})
         .pipe(uglify())
         .pipe(rename({suffix:'.min'}))
         .pipe(sourcemaps.write('./sourcemaps'))
         .pipe(gulp.dest(coffeeDest));
    });
    gulp.watch(jsUrl, function() {
       return gulp.src(jsUrl)
         .pipe(sourcemaps.init())
         .pipe(plumber())
         .pipe(changed(jsDest, {extension: '.min.js'}))
         .pipe(uglify()).on('error', function(err){gutil.log(gutil.colors.red('js compress error!\n') + err)})
         .pipe(rename({suffix:'.min'}))
         .pipe(sourcemaps.write('./sourcemaps'))
         .pipe(gulp.dest(jsDest));
    });
    
});

//-------------------------------------------------//
//|   开始监视less,coffee,改变后编译,刷新浏览器(动态页面,有服务器)
//-------------------------------------------------//
gulp.task('watch-compile-proxy-reload', function() {
    //打开浏览器同步工具
    browserSync({
        proxy: proxyUrl
    });
    gulp.watch(lessUrl, function() {
        return gulp.src(lessUrl)
          .pipe(sourcemaps.init())
          .pipe(plumber())
          .pipe(changed(lessDest, {extension: '.css'}))
          .pipe(less({compress:true})).on('error', function(err){gutil.log(gutil.colors.red('less compile error!\n') + err.message)})
          .pipe(sourcemaps.write('./sourcemaps'))
          .pipe(reload({stream:true}))
          .pipe(gulp.dest(lessDest));
    });
    gulp.watch(coffeeUrl, function() {
       gulp.src(coffeeUrl)
         .pipe(sourcemaps.init())
         .pipe(plumber())
         .pipe(changed(coffeeDest, {extension: '.min.js'}))
         .pipe(coffee({bare: true})).on('error', function(err){gutil.log(gutil.colors.red('coffee compile error!\n') + err)})
         .pipe(uglify()).on('error', function(err){gutil.log(gutil.colors.red('coffee compile js compress error!\n') + err)})
         .pipe(rename({suffix:'.min'}))
         .pipe(sourcemaps.write('./sourcemaps'))
         .pipe(gulp.dest(coffeeDest));
    });
    gulp.watch(jsUrl, function() {
       return gulp.src(jsUrl)
         .pipe(sourcemaps.init())
         .pipe(plumber())
         .pipe(changed(jsDest, {extension: '.min.js'}))
         .pipe(uglify()).on('error', function(err){gutil.log(gutil.colors.red('js compress error!\n') + err)})
         .pipe(rename({suffix:'.min'}))
         .pipe(sourcemaps.write('./sourcemaps'))
         .pipe(gulp.dest(jsDest));
    });
    gulp.watch(viewsAJsUrl).on('change',reload);
});

//-------------------------------------------------//
//|   开始监视less,coffee,改变后编译,刷新浏览器(静态页面)
//-------------------------------------------------//
gulp.task('watch-compile-server-reload', function() {
    //打开浏览器同步工具
    browserSync({
        server: {
            baseDir: serverBaseUrl
        }
    });
    gulp.watch(lessUrl, function() {
        return gulp.src(lessUrl)
          .pipe(sourcemaps.init())
          .pipe(plumber())
          .pipe(changed(lessDest, {extension: '.css'}))
          .pipe(less({compress:true})).on('error', function(err){gutil.log(gutil.colors.red('less compile error!\n') + err.message)})
          .pipe(sourcemaps.write('./sourcemaps'))
          .pipe(reload({stream:true}))
          .pipe(gulp.dest(lessDest));
    });
    gulp.watch(coffeeUrl, function() {
       gulp.src(coffeeUrl)
         .pipe(sourcemaps.init())
         .pipe(plumber())
         .pipe(changed(coffeeDest, {extension: '.min.js'}))
         .pipe(coffee({bare: true})).on('error', function(err){gutil.log(gutil.colors.red('coffee compile error!\n') + err)})
         .pipe(uglify()).on('error', function(err){gutil.log(gutil.colors.red('coffee compile js compress error!\n') + err)})
         .pipe(rename({suffix:'.min'}))
         .pipe(sourcemaps.write('./sourcemaps'))
         .pipe(gulp.dest(coffeeDest));
    });
    gulp.watch(jsUrl, function() {
       return gulp.src(jsUrl)
         .pipe(sourcemaps.init())
         .pipe(plumber())
         .pipe(changed(jsDest, {extension: '.min.js'}))
         .pipe(uglify()).on('error', function(err){gutil.log(gutil.colors.red('js compress error!\n') + err)})
         .pipe(rename({suffix:'.min'}))
         .pipe(sourcemaps.write('./sourcemaps'))
         .pipe(gulp.dest(jsDest));
    });
    gulp.watch(viewsAJsUrl).on('change',reload);
});

//-------------------------------------------------//
//|   开始监视css,js,html(静态页面)
//-------------------------------------------------//
gulp.task('watch-server-reload', function() {
    //打开浏览器同步工具
    browserSync({
        server: {
            baseDir: serverBaseUrl
        }
    });
    gulp.watch('./**/*.css', function() {
        return gulp.src('./**/*.css')
          .pipe(reload({stream:true}));
    });
    gulp.watch(htmlAJsUrl).on('change',reload);
});

//-------------------------------------------------//
//|          全部less文件编译成css
//-------------------------------------------------//
gulp.task('compile-less', function() {
    return gulp.src(lessUrl)
      .pipe(sourcemaps.init())
      .pipe(less({compress:true}))
      .pipe(sourcemaps.write('./sourcemaps'))
      .pipe(gulp.dest(lessDest));
});

//-------------------------------------------------//
//|          全部js文件压缩成.min.js
//-------------------------------------------------//
gulp.task('compress-js', function() {
    return gulp.src(jsUrl)
      .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(rename({suffix:'.min'}))
      .pipe(sourcemaps.write('./sourcemaps'))
      .pipe(gulp.dest(jsDest));
});

//-------------------------------------------------//
//|          全部coffee文件编译成js
//-------------------------------------------------//
gulp.task('compile-coffee', function() {
    return gulp.src(coffeeUrl)
      .pipe(sourcemaps.init())
      .pipe(coffee()).on('error', function(err){gutil.log(gutil.colors.red('init coffee compile error!\nplease fix it!') + err)})
      .pipe(uglify())
      .pipe(rename({suffix:'.min'}))
      .pipe(sourcemaps.write('./sourcemaps'))
      .pipe(gulp.dest(coffeeDest));
});

//-------------------------------------------------//
//|          发布,打包为zip
//-------------------------------------------------//
gulp.task('release', function() {
  gulp.src(releaseUrl)
    .pipe(zip('FE-Template.zip',true))
    .pipe(gulp.dest('./release/latest/'));
  console.log('FE-Template has released!');
});