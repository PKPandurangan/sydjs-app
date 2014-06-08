(function() {
	
	new View('about', {
		
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
				
				// analytics
				app.trackEvent({ label: 'About', category: 'view', action: 'visible' });
				
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
