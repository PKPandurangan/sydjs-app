(function() {
	
	new View('signin-service', {
		
		on: {
			layout: function() {
				
				// cater for iOS 7 / desktop statusbar height
				if (!app._device.system || app._device.system == 'ios') {
					this.$('.titlebar').css('height', parseInt(this.$('.titlebar .wrap').css('height'), 10) + 21);
				}
				
				// iOS: fixes the scrolling & rendering issue when previous/nexting through fields
				if (app._device.system == 'ios' && document.activeElement.tagName.toLowerCase().match(/input|textarea|select/)) {
					return;
				}
				
				// calculate available height
				var availableHeight = app.viewportSize.height
					- this.$('.titlebar').height();
				
				// set height and position of main container to availabe height
				this.$('.container').css({
					height: availableHeight,
					top: this.$('.titlebar').height()
				});
				
			},
			visible: function() {
				
				// iOS: Change status bar style to match view style
				app.changeStatusBarStyle('black');
				
				// Analytics
				// app.trackEvent( 'googleanalytics', 'Enter Password', { category: 'view', action: 'visible' } );
				// app.trackEvent( 'mixpanel', 'Viewing Enter Password', {} );
				
				
			},
			hidden: function() {
				
				//
				
			}
		},
		
		buttons: {
			'.btn-right': 'previous'
		},
		
		previous: function() {
			app.view('signin').reveal('slide-down');
		}
		
	});

})();
