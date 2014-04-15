module.exports = function(grunt) {
	
	grunt.log.write('Beginning build process...');
	
	// Configure Grunt
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		copy: {
			main: {
				files: [
					{ expand: true, cwd: '../../', src: ['*.xml'], dest: '../../www/' },
					{ expand: true, cwd: '../assets/', src: ['**'], dest: '../../www/', filter: function(filepath) {
						return filepath.match(/.js|.css|.min.js|.min.css|.jpg|.png|.gif|.eot|.svg|.ttf|.woff/);
					}}
				]
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
					'../../www/index.html': ['../views/app.jade']
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
					'../../www/css/app/app.min.css': '../assets/css/app.less'
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
				files: [
					'Gruntfile.js',
					
					'../../config.xml',
					'../views/**/*.jade',
					'../assets/**/*.less',
					'../assets/**/*.js'
				],
				tasks: ['copy', 'jade', 'less', 'relativeRoot'],
				options: {}
			}
		}
	});
	
	// Load modules to run
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jade');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-relative-root');
	grunt.loadNpmTasks('grunt-contrib-watch');
	
	// Set tasks to run
	grunt.registerTask('default', ['copy', 'jade', 'less', 'relativeRoot', 'watch']);
	
};
