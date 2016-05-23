'use strict';
var GulpConfig = (function () {
    function gulpConfig() {
        this.buildDir = './build';
        this.source = './src/';
        this.tsOutputPath = this.buildDir + '/js';
        this.allJavaScript = [this.source + '/js/**/*.js', this.tsOutputPath + '/**/*.js'];
        this.allTypeScript = './src/ts/**/*.ts';
        this.typings = './typings/';
        this.libraryTypeScriptDefinitions = './typings/**/*.ts';
    }
    return gulpConfig;
})();
module.exports = GulpConfig;
