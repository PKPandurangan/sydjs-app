(function() {
	
	new View('signin', {
		
		on: {
			layout: function() {
				
				//
				
			},
			visible: function() {
				
				var self = this;
				
				this.$('.titlebar').css('height', Math.ceil(parseInt(this.$('.titlebar').css('height'), 10) + 21));
				
				var availableHeight = app.viewportSize.height
					- this.$('.titlebar').height();
					
				this.$('.container').css({
					height: availableHeight,
					top: this.$('.titlebar').height()
				});
				
				_.each(['github', 'facebook', 'google', 'twitter', 'email'], function(button) {
				
					var $button = self.$('.btn-' + button);
					
					$button.css('height', availableHeight / 5);
					
				});
				
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
			'.btn-email': ''
		},
		
		previous: function() {
			app.view('home').reveal('slide-up');
		}
		
	});

})();
