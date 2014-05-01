module.exports = function(grunt) {
	
	grunt.log.write('Beginning build process...');
	
	// Configure Grunt
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			options: {
				force: true
			},
			release: ['../../www/']
		},
		copy: {
			main: {
				options: {},
				files: [
					// Config XML
					{
						expand: true,
						cwd: '../../',
						src: ['*.xml'],
						dest: '../../www/'
					},
					// CSS
					{
						expand: true,
						cwd: '../assets/css',
						src: ['**'],
						dest: '../../www/css',
						filter: function(filepath) {
							return filepath.match(/\.css|\.min.css/);
						}
					},
					// Images
					{
						expand: true,
						cwd: '../assets/img',
						src: ['**'],
						dest: '../../www/img',
						filter: function(filepath) {
							return filepath.match(/\.jpg|\.png|\.gif|\.svg/);
						}
					},
					// JS
					{
						expand: true,
						cwd: '../assets/js',
						src: ['**'],
						dest: '../../www/js',
						filter: function(filepath) {
							return filepath.match(/\.js|\.min.js/);
						}
					}
				]
			}
		},
		uglify: {
			my_target: {
				options: {
					mangle: true
				},
				files: {
					'../../www/components/async.js': ['../assets/components/async/lib/async.js'],
					'../../www/components/backbone.js': ['../assets/components/backbone/backbone.js'],
					'../../www/components/moment.js': ['../assets/components/moment/moment.js'],
					'../../www/components/underscore.js': ['../assets/components/underscore/underscore.js'],
					'../../www/components/zepto.js': [
						'../assets/components/zeptojs/src/zepto.js',
						'../assets/components/zeptojs/src/data.js',
						'../assets/components/zeptojs/src/event.js',
						'../assets/components/zeptojs/src/ajax.js',
						'../assets/components/zeptojs/src/detect.js',
						'../assets/components/zeptojs/src/selector.js',
						'../assets/components/zeptojs/src/fx.js',
						'../assets/components/zeptojs/src/touch.js'
					]
				}
			}
		},
		jade: {
			compile: {
				options: {
					data: {
						debug: false
					}
				},
				files: {
					'../../www/index.html': ['../assets/views/app.jade']
				}
			}
		},
		less: {
			development: {
				options: {
					paths: ['../source/public/css'],
					compress: true
				},
				files: {
					'../../www/css/app.css': '../assets/css/app.less'
				}
			}
		},
		relativeRoot: {
			www: {
				options: {
					root: '../../www/'
				},
				files: [{
					expand: true,
					cwd: '../../www/',
					src: ['**'],
					dest: '../../www/',
					filter: function(filepath) {
						return filepath.match(/.html|.min.css/).length;
					}
				}]
			}
		},
		watch: {
			scripts: {
				options: {},
				files: [
					'Gruntfile.js',
					
					'../../config.xml',
					'../assets/**/*.jade',
					'../assets/**/*.less',
					'../assets/**/*.js'
				],
				tasks: ['clean', 'copy', 'uglify', 'jade', 'less', 'relativeRoot'] // Does not include 'watch' which would spawn additional grunt processes
			}
		}
	});
	
	// Load modules to run
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jade');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-relative-root');
	grunt.loadNpmTasks('grunt-contrib-watch');
	
	// Set tasks to run
	grunt.registerTask('default', ['clean', 'copy', 'uglify', 'jade', 'less', 'relativeRoot', 'watch']);
	
};
