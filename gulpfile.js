/**
 * gulp 自动构建任务
 * made by marchen
 * time 2015/4/2
 * task gulp default            编译,监听
 *      gulp server             编译,监听,打开浏览器同步工具(静态页面模式)
 *      gulp server-no-compile  监听,打开浏览器同步工具(静态页面模式)
 *      gulp release            这条命令适合开发这个库的开发者使用
 * 待解决问题,less文件修改只会刷新修改的文件,如果一个被引用的文件修改了,引用文件不会自动刷新,需要手动保存下.
 * 技巧提示,当新增文件事件发生时,要重新获取流,不然新文件不会加入监听事件中
 */

var pkg = require('./package.json');
var gulp = require('gulp');
var zip = require("gulp-zip"); //压缩打包成zip
var plumber = require('gulp-plumber'); //修复node错误
var bower = require('gulp-bower'); //移动bower文件到指定位置
var watch = require('gulp-watch'); //修复原本watch增加后不能监视的问题
var gutil = require('gulp-util'); //gulp工具,用来在流中输出
var changed = require('gulp-changed'); //只通过改变的文件流
var jade = require('gulp-jade'); //编译jade文件
var less = require('gulp-less'); //编译less
var watchLess = require('gulp-watch-less'); //监视less文件
var coffee = require('gulp-coffee'); //编译coffee
var sourcemaps = require('gulp-sourcemaps'); //生成map文件
var rename = require("gulp-rename"); //重命名
var uglify = require('gulp-uglify'); //压缩js
var header = require('gulp-header'); //头部banner
var browserSync = require('browser-sync'); //浏览器同步
var autoprefixer = require('autoprefixer'); //less代码自动添加前缀
var postcss = require('gulp-postcss');
var reload = browserSync.reload; //刷新浏览器



var serverBaseUrl = './'; //browserSync 服务器模式目录
var proxyUrl = "localhost:3000"; //browserSync 代理模式路径
var viewsAJsUrl = ['./views/**', './public/js/**/*.js', '!./public/js/**/*.map'];
var cssUrl = ['./public/css/**/*.css'];
var cssDest = './public/css/';
var lessUrl = ['./public/css/**/*.less'];
var lessDest = './public/css/';
var coffeeUrl = ['./public/js/**/*.coffee'];
var coffeeDest = './public/js/';
var jsUrl = ['./public/js/**/*.js', '!./public/js/**/*.min.js', '!./public/js/**/*.map'];
var jsDest = './public/js/';
var releaseUrl = ['./**', '!release/**', '!node_modules/**', '!docs/**', '!npm-debug.log'];
var jadeUrl = ['./views/**/*.jade'];
var jadeDest = './views/';
var bowerDest = 'public/bower';
//-------------------------------------------------//
//| 默认开始编译所有less和coffee文件
//| 监视css,js,和views下的的文件,刷新浏览器(注意:会去编译less和coffee)
//-------------------------------------------------//
var welcome = '欢迎使用 marchen 前端模版\n';
var banner = [
    ' 初始化成功!',
    ' 已经编译 less, coffee, js 文件\n',
    ' 编译规则如下:',
    ' yyy.less   ---- yyy.css(压缩)',
    ' yyy.js     ---- yyy.min.js(压缩)',
    ' xxx.coffee ---- xxx.min.js(压缩)',
    ' xxx.jade   ---- xxx.html(压缩)',
    ' 编译产生的sourcemaps放在sourcemaps文件夹下\n',
    ' 其他gulp 命令:',
    ' gulp default ---- 默认编译 public 除 lib 下所有less, coffee, js',
    ' gulp server  ---- 同 gulp default,增加borwser-sync,服务器模式,路径为是 ./',
    ' gulp server-no-compile - 只启用 browser-sync 的服务器模式,路径为是 ./(不会编译)',
    ' 正在监听文件改变......\n'
].join('\n');
gulp.task('default', ['compile-less', 'compile-coffee', 'compress-js', 'compile-jade', 'watch-compile', 'bower'], function() {
    gutil.log('\n\n', gutil.colors.cyan(welcome) + banner);
});
gulp.task('server', ['compile-less', 'compile-coffee', 'compress-js', 'compile-jade', 'watch-compile-server-reload', 'bower'], function() {
    gutil.log('\n\n', gutil.colors.cyan(welcome) + banner);
});
gulp.task('server-no-compile', ['watch-server-reload', 'bower'], function() {
    gutil.log('\n\n', gutil.colors.cyan(welcome) + banner);
});

//-------------------------------------------------//
//|  开始监视less,coffee,js改变后编译,不刷新浏览器
//-------------------------------------------------//
gulp.task('watch-compile', function() {
    watch(lessUrl, function() {
        return gulp.src(lessUrl)
            .pipe(sourcemaps.init())
            .pipe(plumber())
            .pipe(changed(lessDest, { extension: '.css' }))
            .pipe(less({ compress: true })).on('error', function(err) { gutil.log(gutil.colors.red('less compile error!\n') + err.message); })
            .pipe(postcss([autoprefixer({
                browsers: [
                    'Android >= 4',
                    'Chrome >= 35',
                    'Firefox >= 31',
                    'Explorer >= 9',
                    'iOS >= 7',
                    'Opera >= 12',
                    'Safari >= 7.1',
                ]
            })]))
            .pipe(gulp.dest(lessDest))
            .pipe(sourcemaps.write('./sourcemaps'));
    });
    watch(coffeeUrl, function(event) {
        return gulp.src(coffeeUrl)
            .pipe(sourcemaps.init())
            .pipe(plumber())
            .pipe(changed(coffeeDest, { extension: '.min.js' }))
            .pipe(coffee({ bare: true })).on('error', function(err) { gutil.log(gutil.colors.red('coffee compile error!\n') + err); })
            .pipe(uglify())
            .pipe(rename({ suffix: '.min' }))
            .pipe(sourcemaps.write('./sourcemaps'))
            .pipe(gulp.dest(coffeeDest));
    });
    watch(jsUrl, function() {
        return gulp.src(jsUrl)
            .pipe(sourcemaps.init())
            .pipe(plumber())
            .pipe(changed(jsDest, { extension: '.min.js' }))
            .pipe(uglify()).on('error', function(err) { gutil.log(gutil.colors.red('js compress error!\n') + err); })
            .pipe(rename({ suffix: '.min' }))
            .pipe(sourcemaps.write('./sourcemaps'))
            .pipe(gulp.dest(jsDest));
    });
    watch(jadeUrl, function() {
        return gulp.src(jadeUrl)
            .pipe(jade({}))
            .pipe(gulp.dest(jadeDest));
    });
});

//-------------------------------------------------//
//|   开始监视less,coffee,改变后编译,刷新浏览器(静态页面)
//-------------------------------------------------//
gulp.task('watch-compile-server-reload', function() {
    //打开浏览器同步工具
    browserSync({
        server: {
            baseDir: serverBaseUrl,
            directory: true
        }
    });
    watch(lessUrl, function() {
        return gulp.src(lessUrl)
            .pipe(sourcemaps.init())
            .pipe(plumber())
            .pipe(changed(lessDest, { extension: '.css' }))
            .pipe(less({ compress: true })).on('error', function(err) { gutil.log(gutil.colors.red('less compile error!\n') + err.message); })
            .pipe(postcss([autoprefixer({
                browsers: [
                    'Android >= 4',
                    'Chrome >= 35',
                    'Firefox >= 31',
                    'Explorer >= 9',
                    'iOS >= 7',
                    'Opera >= 12',
                    'Safari >= 7.1',
                ]
            })]))
            .pipe(sourcemaps.write('./sourcemaps'))
            .pipe(gulp.dest(lessDest));
    });
    watch(coffeeUrl, function() {
        return gulp.src(coffeeUrl)
            .pipe(sourcemaps.init())
            .pipe(plumber())
            .pipe(changed(coffeeDest, { extension: '.min.js' }))
            .pipe(coffee({ bare: true })).on('error', function(err) { gutil.log(gutil.colors.red('coffee compile error!\n') + err); })
            .pipe(uglify()).on('error', function(err) { gutil.log(gutil.colors.red('coffee compile js compress error!\n') + err); })
            .pipe(rename({ suffix: '.min' }))
            .pipe(sourcemaps.write('./sourcemaps'))
            .pipe(gulp.dest(coffeeDest));
    });
    watch(jsUrl, function() {
        return gulp.src(jsUrl)
            .pipe(sourcemaps.init())
            .pipe(plumber())
            .pipe(changed(jsDest, { extension: '.min.js' }))
            .pipe(uglify()).on('error', function(err) { gutil.log(gutil.colors.red('js compress error!\n') + err); })
            .pipe(rename({ suffix: '.min' }))
            .pipe(sourcemaps.write('./sourcemaps'))
            .pipe(gulp.dest(jsDest));
    });
    watch(jadeUrl, function() {
        return gulp.src(jadeUrl)
            .pipe(jade({}))
            .pipe(gulp.dest(jadeDest));
    });
    watch(viewsAJsUrl, function() {
        reload();
    });
});

//-------------------------------------------------//
//|   开始监视css,js,html(静态页面)
//-------------------------------------------------//
gulp.task('watch-server-reload', function() {
    //打开浏览器同步工具
    browserSync({
        server: {
            baseDir: serverBaseUrl,
            directory: true
        }
    });
    watch(cssUrl, function() {
        return gulp.src(cssUrl)
            .pipe(reload({ stream: true }))
    });
    watch(viewsAJsUrl, function() {
        reload();
    });
});

//-------------------------------------------------//
//|          全部less文件编译成css
//-------------------------------------------------//
gulp.task('compile-less', function() {
    return gulp.src(lessUrl)
        .pipe(sourcemaps.init())
        .pipe(less({ compress: true }))
        .pipe(postcss([autoprefixer({
            browsers: [
                'Android >= 4',
                'Chrome >= 35',
                'Firefox >= 31',
                'Explorer >= 9',
                'iOS >= 7',
                'Opera >= 12',
                'Safari >= 7.1',
            ]
        })]))
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
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write('./sourcemaps'))
        .pipe(gulp.dest(jsDest));
});

//-------------------------------------------------//
//|          全部coffee文件编译成js
//-------------------------------------------------//
gulp.task('compile-coffee', function() {
    return gulp.src(coffeeUrl)
        .pipe(sourcemaps.init())
        .pipe(coffee()).on('error', function(err) { gutil.log(gutil.colors.red('init coffee compile error!\nplease fix it!') + err); })
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write('./sourcemaps'))
        .pipe(gulp.dest(coffeeDest));
});

//-------------------------------------------------//
//|          全部jade文件编译成html
//-------------------------------------------------//
gulp.task('compile-jade', function() {
    var MY_LOCALS = {};

    gulp.src(jadeUrl)
        .pipe(jade({
            locals: MY_LOCALS
        }))
        .pipe(gulp.dest(jadeDest));
});


//-------------------------------------------------//
//|          全部bower文件移动到public
//-------------------------------------------------//
gulp.task('bower', function() {
    return bower()
        .pipe(gulp.dest(bowerDest));
});

//-------------------------------------------------//
//|          发布,打包为zip
//-------------------------------------------------//
gulp.task('release', function() {
    var zipName = 'FE-Template.zip';
    gulp.src(releaseUrl)
        .pipe(zip(zipName, true))
        .pipe(gulp.dest('./release/latest/'));
    console.log(zipName + ' has released!');
});
