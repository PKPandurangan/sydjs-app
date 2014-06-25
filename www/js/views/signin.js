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
				
				$('.btn-service').css({
					top: availableHeight
				});
				
				setTimeout(function() {
					self.animateView();
				}, 100);
				// }, 150 );
				
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
		
		animateView: function() {
			
			var self = this;
			
			var availableHeight = app.viewportSize.height
				- this.$('.titlebar').height();
			
			var types = ['github', 'facebook', 'google', 'twitter', 'email'];
			
			_.each(types, function(button, index) {
			
				var $button = self.$('.btn-' + button);
				
				$button.css({
					top: availableHeight,
					height: Math.ceil(availableHeight) - (Math.ceil(availableHeight / 5) + (index + 1 == types.length ? Math.ceil(availableHeight / 10) : 0) * index)
				});
				
				$button.find('.action').css('height', Math.ceil(availableHeight / 5));
				
				$button.velocity({
					top: Math.ceil(availableHeight / 5) * index
				}, { delay: index * 100, duration: 1000, easing: [ 600, 30 ] }); 
				
			});
		},
		
		emailSignin: function() {
			app.view('signin-email').show('slide-up');
		},
		
		serviceSignin: function(el) {
			
			var service = $(el.target).data().service;
			
			var options = 'location=no,toolbar=yes,toolbarposition=top,closebuttoncaption=Cancel';
			
			var authWindow = window.open(config.baseURL + '/auth/' + service + '?target=app&version=' + app.data.version, '_blank', options);
			
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
