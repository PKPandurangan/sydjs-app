(function() {
	
	new View('signout', {
		
		on: {
			layout: function() {
				
				//
				
			},
			visible: function() {
				
				this.animateView();
				
				// iOS: Change status bar style to match view style
				app.changeStatusBarStyle('black');
				
				// analytics
				app.trackEvent({ label: 'Signout', category: 'view', action: 'visible' });
				
			},
			hidden: function() {
				
				//
				
			}
		},
		
		buttons: {
			//
		},
		
		animateView: function() {
			
			var availableHeight = app.viewportSize.height;
			
			var position = (availableHeight / 2) - (this.$('.message').height() / 2);
			
			this.$('.message').css({
				opacity: 0,
				marginTop: position + 50
			});
			
			this.$('.message').velocity({
				opacity: 1
			}, { duration: 500, easing: 'linear' });
			
			this.$('.message').velocity({
				marginTop: position - 50,
			}, { duration: 2000, easing: 'linear', queue: false });
			
			setTimeout(function() {
				app.view('home').reveal('slide-up');
			}, 2000);
		
		}
		
	});

})();
