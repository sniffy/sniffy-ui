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
        copy: {
            mock: {
                expand: true,
                cwd: 'dist/',
                src: ['jdbcsniffer.js','jdbcsniffer.min.js'],
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
                src: 'src/jdbcsniffer.js',
                dest: 'dist/jdbcsniffer.js'
            },
            iframe: {
                src: 'src/jdbcsniffer.iframe.html',
                dest: 'build/jdbcsniffer.iframe.html'
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            dist: {
                src: 'dist/jdbcsniffer.js',
                dest: 'dist/jdbcsniffer.min.js'
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
                  "build/jdbcsniffer.css": "src/jdbcsniffer.less"
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
                    'build/jdbcsniffer.iframe.html': 'build/jdbcsniffer.iframe.html'
                }
            }
        },
        imageEmbed: {
            dist: {
              src: [ "bower_components/bootstrap/dist/css/bootstrap.min.css" ],
              dest: "build/bootstrap.embedded.css",
              options: {
                deleteAfterEncoding : false,
                preEncodeCallback: function () { return true; }
              }
            }
          },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile', 'includereplace:iframe', 'htmlmin', 'less', 'jshint', 'includereplace:dist', 'uglify', 'copy']
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

    // Default task
    grunt.registerTask('default', ['imageEmbed', 'includereplace:iframe', 'htmlmin', 'less', 'jshint', 'includereplace:dist', 'uglify', 'copy']);
    grunt.registerTask('travis', ['default']);
};

