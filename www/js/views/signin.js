(function() {
	
	new View('signin', {
		
		on: {
			layout: function() {
				
				//
				
			},
			visible: function() {
				
				var self = this;
				
				this.$('.titlebar').css('height', parseInt(this.$('.titlebar .wrap').css('height'), 10) + 21);
				
				var availableHeight = app.viewportSize.height
					- this.$('.titlebar').height();
					
				this.$('.container').css({
					height: availableHeight,
					top: this.$('.titlebar').height()
				});
				
				_.each(['github', 'facebook', 'google', 'twitter', 'email'], function(button) {
				
					var $button = self.$('.btn-' + button);
					
					$button.css('height', Math.ceil(availableHeight / 5));
					
				});
				
				// iOS: Change status bar style to match view style
				app.changeStatusBarStyle('white');
				
				// analytics
				app.trackEvent({ label: 'Signin', category: 'view', action: 'visible' });
				
			},
			hidden: function() {
				
				//
				
			}
		},
		
		buttons: {
			'.btn-back': 'previous',
			'.btn-github': 'serviceSignin',
			'.btn-facebook': 'serviceSignin',
			'.btn-google': 'serviceSignin',
			'.btn-twitter': 'serviceSignin',
			'.btn-email': 'emailSignin'
		},
		
		previous: function() {
			app.view('home').reveal('slide-down');
		},
		
		emailSignin: function() {
			app.view('signin-email').show('slide-up');
		},
		
		serviceSignin: function(el) {
			
			var service = $(el.target).data().service;
			
			var options = 'location=no,toolbar=yes,toolbarposition=top,closebuttoncaption=Cancel';
			
			var authWindow = window.open(config.baseURL + '/auth/' + service '?target=app&version=' + app.data.versions.build, '_blank', options);
			
			authWindow.addEventListener('loadstop', function() {
				
				var checkAuthUser = setInterval(function() {
					
					authWindow.executeScript({ code: "localStorage.getItem('authUser')" },
						
						function(data) {
							
							var authUser = _.first(data);
							
							if (!authUser) return;
							
							clearInterval(checkAuthUser);
							
							authWindow.close();
							
							app.view('signin-service')._service = service;
							app.view('signin-service')._authUser = JSON.parse(authUser);
							
							app.view('signin-service').show('slide-up');
							
							// alert(authUser);
							
						}
					);
					
				});
				
			});
		}
		
	});

})();
