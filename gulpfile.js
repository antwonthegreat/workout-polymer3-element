var gulp = require('gulp');
var exec = require('child_process').exec;
var browserSync = require('browser-sync').create();

var firstCompile = true;
gulp.task('compile', function (done) {
    var tsc = exec("tsc --watch");
    tsc.stderr.on('close', console.log);
    tsc.stdout.on('data', o => {
        //Prevent tsc from clearing the console with \033c
        console.info(o.replace('\033c', ''));
        if (o.indexOf('Watching for file changes') > -1) {
            if (!firstCompile) {
                browserSync.reload();
            }
            firstCompile = false;
        }
    })
});

gulp.task('serve', (done) => {
    var serve = exec('polymer serve -p 8000 -v'); // --compile never
    serve.stdout.on('data', o => {
        console.log(o);
        if (o.indexOf('Files in this directory are available under the following URLs') > -1) {
            browserSync.init({
                proxy: "localhost:8000",
                startPath: "",
                snippetOptions: {
                    // just append the snippet to the end of the file
                    rule: {
                        match: /$/i,
                        fn: function (snippet, match) {
                            return snippet + match;
                        }
                    }
                }
            });
        }
    })
});

gulp.task('watch', function () {
    var directoriesToWatch = ["index.html", "/images/*.*"]
    directoriesToWatch.forEach(function (directory) {
        console.log(`Listening for changes, ${directory}`);
        gulp.watch(directory, {
            read: false,
            verbose: true
        }).on('change', (_e) => {
            browserSync.reload();
        });
    });
});

gulp.task('default', ['serve', 'compile', 'watch']);


// Polymer purl server
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const del = require('del');

/**
 * Cleans the prpl-server build in the server directory.
 */
gulp.task('prpl-server:clean', () => {
    return del('server/build');
});

/**
 * Copies the prpl-server build to the server directory while renaming the
 * node_modules directory so services like App Engine will upload it.
 */
gulp.task('prpl-server:build', () => {
    const pattern = 'node_modules';
    const replacement = 'node_assets';

    return gulp.src('build/**')
        .pipe(rename(((path) => {
            path.basename = path.basename.replace(pattern, replacement);
            path.dirname = path.dirname.replace(pattern, replacement);
        })))
        .pipe(replace(pattern, replacement))
        .pipe(gulp.dest('server/build'));
});

gulp.task('prpl-server', ['prpl-server:clean',
    'prpl-server:build'
]);