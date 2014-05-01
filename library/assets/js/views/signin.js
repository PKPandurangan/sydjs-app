(function() {
	
	new View('signin', {
		
		on: {
			layout: function() {
				
				//
				
			},
			visible: function() {
				
				var self = this;
				
				var availableHeight = app.viewportSize.height
					- this.$('.titlebar').height();
					
				this.$('.container').css({
					height: availableHeight,
					top: this.$('.titlebar').height()
				});
				
				_.each(['github', 'facebook', 'twitter', 'email'], function(button) {
				
					var $button = self.$('.btn-' + button);
					
					$button.css('height', availableHeight / 4);
					
				});
				
			},
			hidden: function() {
				
				//
				
			}
		},
		
		buttons: {
			'.btn-github': '',
			'.btn-facebook': '',
			'.btn-twitter': '',
			'.btn-email': ''
		},
		
		previous: function() {
			app.view('home').reveal('slide-up');
		}
		
	});

})();
