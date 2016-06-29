'use strict'
const gulp = require('gulp')
const less = require('gulp-less')
const pug = require('gulp-pug')
const watch = require('gulp-watch')
const plumber = require('gulp-plumber')
const autoprefixer = require('autoprefixer')
const postcss = require('gulp-postcss')
const sourcemaps = require('gulp-sourcemaps')
const bs = require('browser-sync').create()

// 配置路径
const direction = {
	pug: {
		src: ['./views/**/*.pug', '!./views/common/**/*.pug'],
		dest: './views',
	},
	less: {
		src: ['./public/**/*.less'],
		dest: './public',
	},
}

gulp.task('pug', () => {
    return watch(direction.pug.src, { ignoreInitial: false })
        .pipe(sourcemaps.init())
        .pipe(plumber())
        .pipe(pug({ pretty: true })).on('error', (error) => { console.log(error.message) })
        .pipe(sourcemaps.write('./sourcemaps'))
        .pipe(gulp.dest(direction.pug.dest))
})

gulp.task('less', () => {
    return watch(direction.less.src, { ignoreInitial: false })
        .pipe(sourcemaps.init())
        .pipe(plumber())
        .pipe(less({ compress: false })).on('error', (error) => { console.log(error.message) })
        .pipe(postcss([autoprefixer({
            browsers: [
                'Android >= 4',
                'Chrome >= 35',
                'Firefox >= 31',
                'Explorer >= 9',
                'iOS >= 7',
                'Opera >= 12',
                'Safari >= 7.1',
                'IE >= 8',
            ]
        })]))
        .pipe(sourcemaps.write('./sourcemaps'))
        .pipe(gulp.dest(direction.less.dest))
})

gulp.task('bs-server', () => {
    bs.init({
        server: {
        	baseDir: direction.pug.dest,
        },
        port: 3001,
        files: [direction.less.dest + '/**/*.css'],
    })
})

gulp.task('bs-proxy', () => {
    bs.init({
        proxy: 'localhost',
        port: 3001,
        files: [direction.less.dest + '/**/*.css'],
    })
})

gulp.task('default', ['pug', 'less', 'bs-server'])