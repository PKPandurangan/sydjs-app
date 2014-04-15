(function() {

	new View('forgot-password', {
	
		on: {
			layout: function() {
				
				var availableHeight = app.viewportSize.height
					- this.$('.titlebar').height();
				
				this.$('.container').css({
					height: availableHeight,
					top: this.$('.titlebar').height()
				});
				
			},
			visible: function() {
			
				// Analytics
				// app.trackEvent( 'googleanalytics', 'Forgot Password', { category: 'view', action: 'visible' } );
				// app.trackEvent( 'mixpanel', 'Viewing Forgot Password', {} );
			
			}
		},
		
		buttons: {
			'.btn-back': 'previous'
		},
		
		previous: function() {
			app.view('welcome').reveal('slide-left');
		}
	
	});

})();
