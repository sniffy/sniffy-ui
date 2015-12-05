module.exports = function (grunt) {
    'use strict';
    // Project configuration
    grunt.initConfig({
        // Metadata
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
            ' Licensed <%= pkg.license %> */\n',
        // Task configuration
        clean: {
            build: {
                src: ['build','dist','mock/sniffy.js','mock/sniffy.min.js']
            }
        },
        copy: {
            mock: {
                expand: true,
                cwd: 'dist/',
                src: ['sniffy.js','sniffy.min.js'],
                dest: 'mock/'
            }
        },
        includereplace: {
            dist: {
                options: {
                  prefix: '//@@',
                  suffix: '',
                  processIncludeContents: function(includeContents, localVars, filePath) {
                    return filePath.endsWith('.js') ? includeContents : 
                      includeContents.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, " ");
                  }
                },
                src: 'src/sniffy.js',
                dest: 'dist/sniffy.js'
            },
            iframe: {
                src: 'src/sniffy.iframe.html',
                dest: 'build/sniffy.iframe.html'
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            dist: {
                src: 'dist/sniffy.js',
                dest: 'dist/sniffy.min.js'
            }
        },
        jshint: {
            options: {
                node: true,
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                unused: true,
                eqnull: true,
                browser: true,
                globals: { jQuery: true },
                boss: true
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            dist: [
                'src/*.js'
            ]
        },
        less: {
            options: {
              compress: true,
              yuicompress: true,
              optimization: 2
            },
            dist: {
                files: {
                  "build/sniffy.css": "src/less/sniffy.less",
                  "build/sniffy.iframe.css": "src/less/sniffy.iframe.less"
                }
            }
        },
        qunit: {
            files: ['test/**/*.html']
        },
        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                    minifyCSS: true,
                    minifyJS: true
                },
                files: {
                    'build/sniffy.iframe.html': 'build/sniffy.iframe.html'
                }
            }
        },
        imageEmbed: {
            dist: {
              src: [ "build/sniffy.iframe.css" ],
              dest: "build/sniffy.iframe.embedded.css",
              options: {
                deleteAfterEncoding : false,
                preEncodeCallback: function () { return true; }
              }
            }
          },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile', 'less', 'includereplace:iframe', 'htmlmin', 'jshint', 'includereplace:dist', 'uglify', 'copy']
            },
            htmlmin: {
                files: 'src/*.html',
                tasks: ['includereplace:iframe','htmlmin:dist','jshint:dist','includereplace:dist','uglify:dist','copy:mock']
            },
            src: {
                files: 'src/*.js',
                tasks: ['jshint:dist','includereplace:dist','uglify:dist','copy:mock']
            },
            styles: {
                files: ['src/*.less'],
                tasks: ['less:dist','copy:mock'],
                options: {
                    nospawn: true
                }
            }
        }
    });

    // These plugins provide necessary tasks
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-include-replace');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-notify');
    grunt.loadNpmTasks("grunt-image-embed");
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Default task
    grunt.registerTask('default', ['less', 'imageEmbed', 'includereplace:iframe', 'htmlmin', 'jshint', 'includereplace:dist', 'uglify', 'copy']);
    grunt.registerTask('travis', ['default']);
    grunt.registerTask('travis', ['clean:build']);
};

