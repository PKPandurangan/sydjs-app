(function() {
	
	new View('terms-and-conditions', {
	
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
				// app.trackEvent( 'googleanalytics', 'Terms & Conditions', { category: 'view', action: 'visible' } );
				// app.trackEvent( 'mixpanel', 'Viewing Terms & Conditions', {} );
			
			}
		},
		
		buttons: {
			'.btn-back': 'previous'
		},
		
		previous: function() {
			
			if (app.data.session.customer) {
				app.view('home').reveal('slide-left');
			} else {
				app.view('register-details').reveal('slide-down');
			}
			
		}
		
	});

})();
