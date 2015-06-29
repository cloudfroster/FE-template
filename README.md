#FE-template
### front-end project template and development environment
#website [FE-Template](https://preview.c9.io/chen844033231/fe-template/docs/index.html?_c9_id=livepreview2&_c9_host=https://ide.c9.io)
### use nodejs + express + gulp + coffeescript + less + ejs + jquery1.11.2 + lessHat.less + marchen.less + normalize.css

#change log
## version 0.1.1
###### optimization directory, fix a little bug

## version 0.1.0
###### add jade file

## version 0.0.9
###### add bower package manage
###### increase the number of sites
###### fix a number of bug

## version 0.0.8
###### fix gulp.watch(),if file add or create,then the new file will not be watch at all.
###### js lib add scrollReveal-2.2.0.min.js.
###### fix after less compile finish,then will be reload browser, fix a lot bug.

## version 0.0.7
###### replace `gulp localhost` to `gulp proxy`,it will open browser to proxy `localhost:3000`,you can change it in gulpfile.js file
###### add     `gulp server` to open static catalog, it will be compile
###### add     `gulp server-no-compile` to open static catalog, it not to compile less or coffee or js files

## version 0.0.6
###### add docs catalog to show how to use it
###### add `gulp release` task to zip files to down

## version 0.0.5
###### add gitignore file,now build file will not push to git. fix some bug. 

## version 0.0.4
### change gulp task:
###### `gulp`  ------ watch less, coffee, js, and views direction files.when changed compile them.
###### `gulp localhost`  ------ use browser-sync tool watch less, coffee, js, and views direction files. when change compile them and reload browser.
