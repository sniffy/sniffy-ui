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
            dist: {
                expand: true,
                cwd: 'dist/',
                src: '**',
                dest: 'mock/'
            },
        },
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            dist: {
                src: ['src/jdbcsniffer.js'],
                dest: 'dist/jdbcsniffer.js'
            }
        },
        includereplace: {
            dist: {
                options: {
                  prefix: '//@@',
                  suffix: ''
                },
                src: 'dist/jdbcsniffer.js',
                dest: 'dist/jdbcsniffer.js'
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
                  "dist/jdbcsniffer.css": "src/jdbcsniffer.less" // destination file and source file
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
                    collapseWhitespace: true
                },
                files: {
                    'dist/jdbcsniffer.html': 'src/jdbcsniffer.html',
                    'dist/jdbcsniffer.iframe.html': 'src/jdbcsniffer.iframe.html'
                }
            }
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            htmlmin: {
                files: 'src/*.html',
                tasks: ['htmlmin:dist','jshint:dist','concat:dist','includereplace:dist','uglify:dist','copy:dist']
            },
            src: {
                files: 'src/*.js',
                tasks: ['jshint:dist','concat:dist','includereplace:dist','uglify:dist','copy:dist']
            },
            styles: {
                files: ['src/*.less'], // which files to watch
                tasks: ['less:dist','copy:dist'/*,'replace:dist'*/],
                options: {
                    nospawn: true
                }
            }
        }
    });

    // These plugins provide necessary tasks
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-include-replace');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-notify');

    // Default task
    grunt.registerTask('default', ['concat', 'htmlmin', 'less', 'jshint', /*'qunit',*/ 'includereplace', 'uglify', 'copy']);
};

