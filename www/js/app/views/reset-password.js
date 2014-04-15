(function() {

	new View('reset-password', {
	
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
				// app.trackEvent( 'googleanalytics', 'Reset Password', { category: 'view', action: 'visible' } );
				// app.trackEvent( 'mixpanel', 'Viewing Reset Password', {} );
			
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
