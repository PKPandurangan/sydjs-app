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
				
			},
			hidden: function() {
				
				//
				
			}
		},
		
		buttons: {
			'.btn-back': 'previous',
			'.btn-github': '',
			'.btn-facebook': '',
			'.btn-google': '',
			'.btn-twitter': '',
			'.btn-email': 'emailSignin'
		},
		
		previous: function() {
			app.view('home').reveal('slide-down');
		},
		
		emailSignin: function() {
			app.view('signin-email').show('slide-up');
		}
		
	});

})();
