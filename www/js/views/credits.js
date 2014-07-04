(function() {
	
	new View('credits', {
		
		initialize: function() {
		
			//
		
		},
		
		on: {
			layout: function() {
				
				var availableHeight = app.viewportSize.height
					- this.$('.statusbar').height();
					- this.$('.footer').height();
					
				this.$('.container').css({
					height: availableHeight
				});
				
			},
			visible: function() {
				
				// iOS: Change status bar style to match view style
				app.changeStatusBarStyle('white');
				
				var availableHeight = app.viewportSize.height
					- this.$('.statusbar').height();
					- this.$('.footer').height();
				
				this.$('.text').css({
					marginTop: (availableHeight / 2) - (this.$('.text').height() / 2) - (this.$('.footer').height() / 2)
				});
				
				// analytics
				app.trackEvent({ label: 'Credits', category: 'view', action: 'visible' });
				
			}
		},
		
		buttons: {
			'.close': 'back',
			'.link': 'openLink'
		},
		
		back: function() {
			app.view('home').reveal('slide-up');
		},
		
		openLink: function(e) {
			window.open($(e.target).data().link, '_system');
		}
		
	});
	
})();
