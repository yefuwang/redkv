'use strict';

require('dotenv').config();

var gulp = require('gulp');
const mocha = require('gulp-mocha');

gulp.task('t', () => {
    process.env.NODE_ENV='test';
    return gulp.src('test/01_test_installation.js', {read: false})
    .pipe(mocha({"exit":true,"bail":true}))
    .once('error', () => {
        console.log('Exit by error');
        process.exit(1);
    })
    .once('end', () => {
        process.exit();
    })
    ;
});

gulp.task('test_install', () => {
    process.env.NODE_ENV='test';
    return gulp.src('test_install/*.js', {read: false})
    .pipe(mocha({"exit":true,"bail":true}))
    .once('error', () => {
        console.log('Exit by error');
        process.exit(1);
    })
    .once('end', () => {
        process.exit();
    })
    ;
});


gulp.task('test', () => {
    process.env.NODE_ENV='test';
    return gulp.src('test/test_*.js', {read: false})
    .pipe(mocha({"exit":true,"bail":true, "reporter":"spec"}))
    .once('error', () => {
        console.log('Exit by error');
        process.exit(1);
    })
    .once('end', () => {
        process.exit();
    })
    ;
});

