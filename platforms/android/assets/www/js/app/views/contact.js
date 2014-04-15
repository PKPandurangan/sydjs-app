(function() {

	new View('contact', {
	
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
				// app.trackEvent( 'googleanalytics', 'Contact', { category: 'view', action: 'visible' } );
				// app.trackEvent( 'mixpanel', 'Viewing Contact', {} );
			
			}
		},
		
		buttons: {
			'.btn-back': 'previous'
		},
		
		previous: function() {
			app.view('home').reveal('slide-left');
		}
	
	});

})();
