(function() {
	
	new View('home', {
		
		initialize: function() {
		
			//
		
		},
		
		on: {
			layout: function() {
				
				var availableHeight = app.viewportSize.height
					- this.$('.titlebar').height()
					- this.$('.toolbar').height();
					
				this.$('.container').css({
					height: availableHeight,
					top: this.$('.titlebar').height()
				});
				
			},
			visible: function() {
				
				this.setState();
				
				this.getStatus();
				
				// Analytics
				// app.trackEvent( 'googleanalytics', 'Rewards', { category: 'view', action: 'visible' } );
				// app.trackEvent( 'mixpanel', 'Viewing Rewards', {} );
				
			}
		},
		
		buttons: {
			'.btn-notifications': 'toggleNotifications',
			'.btn-menu': 'toggleMenu',
			
			'.rsvp .btn-attending': 'rsvpAttending',
			'.rsvp .btn-not-attending': 'rsvpNotAttending',
			
			'.rsvp-not-attending .btn-cancel': 'rsvpCancel',
			
			'.rsvp-attending .btn-cancel': 'rsvpCancel'
		},
		
		toggleNotifications: function() {
			console.log('toggle notifications');
		},
		
		toggleMenu: function() {
			console.log('toggle menu');
		},
		
		setState: function() {
		
			var $states = this.$('.states');
			
			var $rsvp = $states.find('.rsvp'),
				$rsvpNotAttending = $states.find('.rsvp-not-attending'),
				$rsvpAttending = $states.find('.rsvp-attending'),
				$soldOut = $states.find('.sold-out'),
				$ticketsSoon = $states.find('.tickets-soon');
			
			// $rsvp.hide();
			$rsvpNotAttending.hide();
			$rsvpAttending.hide();
			$soldOut.hide();
			$ticketsSoon.hide();
		
		},
		
		rsvpAttending: function() {
			console.log('rsvp attending');
		},
		
		rsvpNotAttending: function() {
			console.log('rsvp not attending');
		},
		
		rsvpCancel: function() {
			console.log('rsvp cancel');
		},
		
		getStatus: function() {
			app.getStatus(function(err) {
				if (err) app.showNotification('Alert', 'Sorry, there was a problem retrieving latest status. Please try again.');
			});
		}
		
	});
	
})();
