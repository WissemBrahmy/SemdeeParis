module.exports = function (grunt) {

    var outputDirectory = 'dist';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // Fetch bower dependencies in "lib" folder
        bower: {
            install: {

            }
        },

        // Inject angular APP dependencies (js and css) in index.html
        injector: {
            options: {
                addRootSlash: false
            },
            local_dependencies: {
                files: {
                    'index.html': ['app/*.js', 'app/js/**/*.js', 'public/css/*.css']
                }
            }
        },

        // Inject libraries depencies (css and js) in index.html
        wiredep: {
            task: {
                src: ['index.html']
            }
        },

        // Task that will clean directories before or after performing a task
        clean: {
            install: {
                src: ['bower_components', 'lib']
            },
            beforeDeploy: {
                src: [outputDirectory]
            },
            afterDeploy: {
                src: ['.tmp']
            }
        },

        // Copy useful files to "dist" directory
        copy: {
            main: {
                expand: true,
                cwd: 'app/',
                src: ['**', '!js/**', '!lib/**', '!**/*.css', '!**/*.js'],
                dest: outputDirectory + '/app/'
            },
            index: {
                src: 'index.html',
                dest: outputDirectory + '/index.html'
            },
            images: {
                expand: true,
                cwd: 'public/',
                src: ['**', '!**/*.css', '!**/*.js'],
                dest: outputDirectory + '/public/'
            },
            fonts: {
                expand: true,
                flatten: true,
                //cwd: 'lib/',
				cwd:'bower_components/font-awesome/fonts',
                src: ['**/*.{otf,eot,svg,ttf,woff,woff2}'],
                dest: outputDirectory + '/public/fonts/'
            },
			bootstrapfonts: {
                expand: true,
                flatten: true,
				cwd:'bower_components/bootstrap/fonts',
                src: ['**/*.{otf,eot,svg,ttf,woff,woff2}'],
                dest: outputDirectory + '/public/fonts/'
            },
            uigridfonts:{
                expand: true,
                flatten: true,
                cwd:'bower_components/angular-ui-grid',
                src: ['**/*.{otf,eot,svg,ttf,woff,woff2}'],
                dest: outputDirectory + '/public/css/'
            }
        },

        rev: {
            files: {
                src: [outputDirectory + '/**/*.{js,css}']
            }
        },

        useminPrepare: {
            html: 'index.html'
        },

        usemin: {
            html: [outputDirectory + '/index.html']
        },

        uglify: {
            options: {
                report: 'min',
                mangle: true,
                compress: {
                    drop_console: true
                }
            }
        },

        compress: {
            main: {
                options: {
                    archive: './dist/dist.tar.gz',
                    mode: 'tgz'
                },
                cwd:'dist',
                files: [
                    {expand: true, src: ['**'], cwd: 'dist/'}
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-injector');
    grunt.loadNpmTasks("grunt-wiredep");
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-rev');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-contrib-compress');

    // Deploy the web app (get necessary JS and CSS files, minify and uglify them, then deliver the app in a delivery folder)
    // Should be called to deliver the app. Result is stored in "dist" directory.
    grunt.registerTask('deploy', [
        'clean:beforeDeploy', 'copy', 'useminPrepare', 'concat', 'uglify', 'cssmin', 'rev', 'usemin', 'clean:afterDeploy', 'compress'
    ]);

    // Install bower dependencies, then update index.html file with JS and CSS dependencies.
    // Should be called after adding or changing dependencies in bower.
    grunt.registerTask('install', [
        'clean:install', 'bower', 'wiredep', 'injector'
    ]);

    // Update index.html file with JS and CSS file related to the app
    // Should be callend after adding a new css or JS file related to the app
    grunt.registerTask('update', [
        'injector'
    ]);
};
